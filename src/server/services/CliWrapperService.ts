import cp from 'child_process';
import path from 'path';
import { LoggerService } from '#shared/index.ts';

export default class CliWrapperService {
    public process: cp.ChildProcess | null = null;
    public appBasePath: string;
    public env = new Map<string, any>();
    public args: string[] = [];
    public configArguments = new Map<string, string>();
    public configFiles: string[] = [];
    public debug: boolean = false;
    public logger = new LoggerService();

    public static create() {
        return new CliWrapperService();
    }

    public setBasePath(path: string) {
        this.appBasePath = path;
        return this;
    }

    public setDebug(debug: boolean) {
        this.debug = debug;
        return this;
    }

    public setLogger(logger: LoggerService) {
        this.logger = logger;
        return this;
    }

    public addConfigArgument(key: string, value: string) {
        this.configArguments.set(key, value);
        return this;
    }

    public addConfigFile(...filePaths: string[]) {
        this.configFiles.push(...filePaths);
        return this;
    }

    public addEnv(key: string, value: any) {
        this.env.set(key, value);
        return this;
    }

    public loadConfigArguments() {
        const configArgs = process.argv.slice(2).filter(arg => arg.startsWith('@config:'))

        for (const entry of configArgs) {
            const [key, value] = entry.slice('@config:'.length).split('=').map(s => s.trim());

            this.configArguments.set(key, value);
        }
    }

    public loadConfigFiles() {
        const configFileArgs = process.argv.slice(2)
            .filter(arg => arg.startsWith('@config-file:'))
            .map(arg => arg.slice('@config-file:'.length));

        this.addConfigFile(...configFileArgs);

        if (process.env.CONFIG_FILES) {
            const envFiles = process.env.CONFIG_FILES.split(',').map(f => f.trim()).filter(Boolean);

            this.addConfigFile(...envFiles);
        }
    }

    public loadEnvironment() {
        const configArguments = Array.from(this.configArguments.entries())
            .map(([key, value]) => `${key}=${value}`).join(';');

        this.addEnv('ZENITH_CONFIG_ARGUMENTS', configArguments);
        this.addEnv('ZENITH_CONFIG_FILES', this.configFiles.join(','));


        // 1. Force color output even when stdio is piped
        // Respect existing environment settings if FORCE_COLOR is already set externally
        if (process.env.FORCE_COLOR !== undefined) {
            this.addEnv('FORCE_COLOR', process.env.FORCE_COLOR);
        } else {
            // '1' enables basic colors, '2' for 256 colors, '3' for 16m truecolor
            this.addEnv('FORCE_COLOR', '1');
        }

        // 2. Set COLORTERM to signal truecolor support to library detectors
        if (process.env.COLORTERM) {
            this.addEnv('COLORTERM', process.env.COLORTERM);
        }

        // 3. Force chalk/supports-color to keep colors enabled
        this.addEnv('CLI_COLOR', '1');
    }

    public loadArguments(args: string[] = []) {
        const namespaces = ['@config:', '@config-file:'];

        const forwardArgs = args.filter(arg => !namespaces.some(ns => arg.startsWith(ns)));

        this.args = [
            '--no-warnings',
            '--experimental-strip-types',
            '--enable-source-maps',
            path.join(this.appBasePath, 'server', 'cli.ts'),
            ...forwardArgs,
        ];

    }

    public kill(code: number = 0) {
        if (this.process && !this.process.killed) {
            this.process.kill('SIGTERM');
        }

        process.exit(code);
    }

    public async run(args?: string[]) {
        if (!this.appBasePath) {
            throw new Error('Base path not set. Please call setBasePath() before run().');
        }

        this.loadConfigArguments();
        this.loadConfigFiles();
        this.loadArguments(args || process.argv.slice(2));

        this.loadEnvironment();

        if (this.debug) {
            this.logger.debug('run', {
                args: this.args,
                env: this.env,
            })
        }

        // Pipe stdout and stderr so we can manage and flush output directly
        this.process = cp.spawn('node', this.args, {
            stdio: ['inherit', 'pipe', 'pipe'],
            env: {
                ...process.env,
                ...Object.fromEntries(this.env.entries()),
            }
        });

        if (this.process.stdout) {
            this.process.stdout.pipe(process.stdout);
        }

        if (this.process.stderr) {
            // Forward child process stderr to parent process stdout if stdout is piped
            // This ensures tools like `grep` catch error logs without needing `2>&1`
            if (!process.stdout.isTTY) {
                this.process.stderr.pipe(process.stdout);
            } else {
                this.process.stderr.pipe(process.stderr);
            }
        }

        process.on('SIGINT', () => this.kill());
        process.on('SIGTERM', () => this.kill());
        process.on('exit', () => this.kill());
    }
}
