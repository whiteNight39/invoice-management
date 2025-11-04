import { ID, Account } from "node-appwrite";
import client from "../config/appwrite";
import {BaseResponse, SignupDto } from "../dto";
import { Users } from "node-appwrite";

const account = new Account(client);
const users = new Users(client);


export class AuthService {

    static async signup(body: SignupDto): Promise<BaseResponse> {
        const { email, password, name } = body;

        try {
            // Create user in Appwrite
            const user = await account.create({
                userId: ID.unique(),
                email,
                password,
                name
            });

            return {
                status: 201,
                success: true,
                message: "User registered successfully",
                data: {
                    userId: user.$id
                }
            };

        } catch (error: any) {
            console.error("Appwrite signup error:", error);

            return {
                status: 400,
                success: false,
                message: error?.message || "Unable to register user"
            };
        }
    }

    static async login(email: string, password: string): Promise<BaseResponse> {
        try {
            // Create email/password session
            const session = await account.createEmailPasswordSession({
                email,
                password
            });

            // Create a JWT for this session
            const jwtResult = await users.createJWT({
                userId: session.userId,
                duration: 3600 // optional, in seconds
            });

            return {
                status: 200,
                success: true,
                message: "Login successful",
                data: {
                    sessionId: session.$id,
                    userId: session.userId,
                    jwt: jwtResult.jwt
                }
            };

        } catch (error: any) {
            console.error("Appwrite login error:", error);

            return {
                status: 401,
                success: false,
                message: error?.message || "Invalid email or password"
            };
        }
    }
}
