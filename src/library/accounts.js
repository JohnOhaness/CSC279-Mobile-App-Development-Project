import { getRandomBytesAsync } from "expo-crypto";
import { scryptAsync } from "@noble/hashes/scrypt";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils";
import * as z from "zod";
import { loadLocalValue, saveLocalValue } from "./storage";

export const DEMO_EMAIL = "hi@gmail.com";
export const passwordHint = "Use at least 8 characters, including a number and a symbol.";

function validEmail(input) {
  const email = input.trim().toLowerCase();
  if (!z.email().safeParse(email).success) throw new Error("Enter a valid email address.");
  return email;
}

async function verifier(password, salt) {
  const bytes = await scryptAsync(password, hexToBytes(salt), { N: 32768, r: 8, p: 1 });
  return bytesToHex(bytes);
}

export async function registerAccount(input, password) {
  const email = validEmail(input);
  const length = Array.from(password).length;
  if (length < 8) {
    const missing = 8 - length;
    throw new Error("Add " + missing + " more " + (missing === 1 ? "character" : "characters") + " to your password.");
  }
  if (!/\p{N}/u.test(password)) throw new Error("Add a number to your password.");
  if (!/[\p{P}\p{S}]/u.test(password)) throw new Error("Add a symbol such as ! or # to your password.");
  const key = "account:" + email;
  async function create() {
    if (email === DEMO_EMAIL || await loadLocalValue(key)) {
      throw new Error("An account with this email already exists on this device.");
    }
    const salt = bytesToHex(await getRandomBytesAsync(16));
    await saveLocalValue(key, { salt, hash: await verifier(password, salt) });
    return email;
  }
  if (globalThis.navigator?.locks?.request) return navigator.locks.request(key, create);
  return create();
}

export async function authenticate(input, password) {
  const email = validEmail(input);
  if (email === DEMO_EMAIL && password === "john1234") return email;
  const account = await loadLocalValue("account:" + email);
  if (!account || await verifier(password, account.salt) !== account.hash) {
    throw new Error("Email or password is incorrect.");
  }
  return email;
}
