import { Request, Response } from "express";
import { AuthService } from "../service";

export class AuthController {

    // POST /auth/signup
    static async signup(req: Request, res: Response) {
        try {
            const response = await AuthService.signup(req.body);
            return res.status(response.status).json(response);
        } catch (error: any) {
            console.error("Controller signup error:", error);
            return res.status(500).json({
                status: 500,
                success: false,
                message: "Internal server error"
            });
        }
    }

    // POST /auth/login
    static async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            const response = await AuthService.login(email, password);
            return res.status(response.status).json(response);

        } catch (error: any) {
            console.error("Controller login error:", error);
            return res.status(500).json({
                status: 500,
                success: false,
                message: "Internal server error"
            });
        }
    }
}
