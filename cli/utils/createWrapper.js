import { CliWrapperService } from '../../dist/server/index.mjs';

/** @typedef CreateWrapperOptions
 * @property {string} [zenithDirectory] - The base path of the project. If not provided, it will be read from the ZENITH_BASE_PATH environment variable.
 * @property {string} [cwd] - The base path of the project. If not provided, it will be read from the ZENITH_BASE_PATH environment variable.
* */

/**
 * Creates and runs the CliWrapperService with the provided options.
 * @param {CreateWrapperOptions} options - The options for creating the wrapper.
 */
export default function createWrapper(options) {
    return CliWrapperService
        .create()
        .setBasePath(options.zenithDirectory)
}

