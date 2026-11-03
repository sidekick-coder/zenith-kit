import { undeleted } from '#server/queries/softDelete.ts'
import type HasherService from './HasherService.ts'
import database from '#server/facades/database.ts'
import type TokenRepository from '#server/repositories/TokenRepository.ts'
import UserEntity from '#shared/entities/UserEntity.ts'
import type UserRepository from '#server/repositories/UserRepository.ts'

export interface LoginCredentials {
    uuid: string
    password: string
}

export interface RegisterCredentials {
    username: string
    email: string
    password: string
}

export interface AuthResult {
    user: UserEntity | null
    token?: string
    success: boolean
    message: string
}

export interface AuthenticateOptions {
    tokenTypes?: string[]
}

export default class AuthService {
    public static __container_entry_key = 'AuthService'

    public hasher: HasherService
    public userRepository: UserRepository
    public tokenRepository: TokenRepository

    public static create(){
        return new AuthService()
    }

    public setHasher(hasher: HasherService) {
        this.hasher = hasher
        return this
    }

    public setUserRepository(userRepository: UserRepository) {
        this.userRepository = userRepository
        return this
    }

    public setTokenRepository(tokenRepository: TokenRepository) {
        this.tokenRepository = tokenRepository
        return this
    }

    // private tokenService = new TokenService()

    async createTokenForUser(userId: number, type: string = 'auth', expiresInHours?: number) {
        // Create auth token on successful login
        const entity = await this.tokenRepository.generate({
            user_id: userId,
            type: type,
            expires_in_hours: expiresInHours || 24 // Token expires in 24 hours by default
        })

        return entity
    }

    async login(credentials: LoginCredentials): Promise<AuthResult> {
        const { uuid, password } = credentials

        const user = await this.userRepository.db.selectFrom('users')
            .selectAll()
            .where((eb) => eb.or([
                eb('email', '=', uuid),
                eb('username', '=', uuid),
            ]))
            .where(undeleted)
            .executeTakeFirst()

        if (!user) {
            return {
                user: null,
                success: false,
                message: $t('Invalid credentials')
            }
        }


        if (!user.verified_at) {
            return {
                user: null,
                success: false,
                message: $t('Please verify your email before logging in')
            }
        }

        const passwordMatches = await this.hasher.compare(password, user.password)

        if (!passwordMatches) {
            return {
                user: null,
                success: false,
                message: $t('Invalid credentials')
            }
        }

        // Create auth token on successful login
        const token = await this.tokenRepository.generate({
            user_id: user.id,
            type: 'auth',
            expires_in_hours: 24 // Token expires in 24 hours
        })

        return {
            user: UserEntity.from({
                id: user.id,
                username: user.username,
                email: user.email,
                verified_at: user.verified_at
            }),
            token: token.token,
            success: true,
            message: 'Login successful'
        }
    }

    async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return this.hasher.compare(plainPassword, hashedPassword)
    }

    async hashPassword(password: string): Promise<string> {
        return this.hasher.hash(password)
    }

    async authenticate(tokenValue?: string | null, options?: AuthenticateOptions) {
        if (!tokenValue) {
            return null
        }

        const token = await this.tokenRepository.findActiveToken(tokenValue)

        if (!token) {
            return null
        }

        const allowedTypes = options?.tokenTypes || ['auth']

        if (!allowedTypes.includes(token.type)) {
            return null
        }

        return await this.userRepository.findById(token.user_id)
    }

    async register(credentials: RegisterCredentials): Promise<AuthResult> {
        const { username, email, password } = credentials

        // Check if user already exists
        const existingUser = await database.selectFrom('users')
            .selectAll()
            .where((eb) => eb.or([
                eb('email', '=', email),
                eb('username', '=', username),
            ]))
            .where(undeleted)
            .executeTakeFirst()

        if (existingUser) {
            return {
                user: null,
                success: false,
                message: 'User already exists with this email or username'
            }
        }

        // Create new user
        const newUser = await this.userRepository.create({
            name: username,
            username,
            email,
            password: password,
            verified_at: new Date().toISOString()
        })

        return {
            user: UserEntity.from({
                id: newUser.id!,
                username: newUser.username,
                email: newUser.email,
                verified_at: newUser.verified_at
            }),
            success: true,
            message: 'Registration successful'
        }
    }

    async logout(tokenValue: string): Promise<boolean> {
        return this.tokenRepository.revoke(tokenValue)
    }
}
