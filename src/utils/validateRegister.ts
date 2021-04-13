import { UsernamePasswordInput } from "src/resolver/UsernamePasswordInput"

export const validateRegister = (options: UsernamePasswordInput) => {
    if (options.username.length <= 2) {
        return [
            {
                field: "username",
                message: "Username needs to be longer than 2"

            }
        ]

    }

    if (!options.email.includes("@")) {
        return [
            {
                field: "email",
                message: "invalid email"

            }
        ]

    }

    if (options.username.includes("@")) {
        return [
            {
                field: "usrename",
                message: "usrename can't conclude @ sign"

            }
        ]

    }

    if (options.password.length < 8) {
        return [
            {
                field: "password",
                message: "Password must be atleast 8 chars"

            }
        ]

    }

    return null
}