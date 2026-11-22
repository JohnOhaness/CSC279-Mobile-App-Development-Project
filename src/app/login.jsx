import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text } from "react-native";

import * as z from "zod";
import AppButton from "../components/AppButton";
import AppScreen from "../components/AppScreen";
import AppTextInput from "../components/AppTextInput";

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");

    const mockEmail = "student@example.com";
    const mockPassword = "password2026";

    //Form Validation using Zod
    const loginSchema = z.object({
        email: z.email("Enter a valid email address."),
        password: z.string().min(6, "Use at least 6 characters for the password")
    })


    function handleLogin() {

        setError("");

        //Check the values against the zod schema
        const result = loginSchema.safeParse({
            email: email,
            password: password
        })

        if (result.success === false) {
            setError(result.error.issues[0].message);
            return;
        }

        if (email !== mockEmail || password !== mockPassword) {
            setError("Email or password is incorrect.")
            return;
        }

        router.replace("/tasks");
    }

    return (
        <AppScreen>
            <Text style={styles.heading}>Welcome back!</Text>

            <Text style={styles.label}>Email</Text>

            <AppTextInput value={email}
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={setEmail}
                placeholder="Please enter your email address"
                keyboardType="email-address"
            />

            <Text style={styles.label}>Password</Text>
            <AppTextInput
                value={password}
                autoComplete="current-password"
                autoCapitalize="none" autoCorrect={false}
                secureTextEntry
                onChangeText={setPassword}
                placeholder="Please enter your password"
            />


            {/* Show form errors for all fields */}
            {error.length > 0 &&
                <Text style={styles.error}>{error}</Text>
            }

            <AppButton text="Submit" onPress={handleLogin} />
        </AppScreen>
    )
}


const styles = StyleSheet.create({

    heading: {
        fontSize: 20, fontWeight: "bold", color: "#203B35", marginBottom: 24
    },
    label: {
        fontSize: 16,
        color: "#203B35", marginTop: 12
    },

    error: {
        color: "#A03026"
    }
})
