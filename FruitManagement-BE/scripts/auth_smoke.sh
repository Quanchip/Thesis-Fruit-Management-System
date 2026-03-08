#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8080}"
USER_NAME="${USER_NAME:-smoke_user_$(date +%s)}"
FULL_NAME="${FULL_NAME:-Smoke Test User}"
EMAIL="${EMAIL:-${USER_NAME}@example.com}"
PHONE="${PHONE:-$(printf "0%09d" $((RANDOM % 1000000000)))}"
PASSWORD="${PASSWORD:-Sm0keTest!}"
BANK_ACCOUNT="${BANK_ACCOUNT:-Vietcombank-123456789012}"

echo "Base URL: ${BASE_URL}"
echo "Signup user: ${USER_NAME} / ${EMAIL}"

signup_response="$(curl -sS -X POST "${BASE_URL}/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"full_name\": \"${FULL_NAME}\",
    \"user_name\": \"${USER_NAME}\",
    \"user_password\": \"${PASSWORD}\",
    \"phone\": \"${PHONE}\",
    \"email\": \"${EMAIL}\",
    \"bank_account\": \"${BANK_ACCOUNT}\"
  }")"

echo "Signup response:"
echo "${signup_response}"

refresh_token="$(echo "${signup_response}" | sed -n 's/.*"refresh_token":"\([^"]*\)".*/\1/p')"
verification_token="$(echo "${signup_response}" | sed -n 's/.*"email_verification_token":"\([^"]*\)".*/\1/p')"

if [[ -n "${verification_token}" ]]; then
  echo "Verifying email..."
  curl -sS -X POST "${BASE_URL}/auth/verify-email" \
    -H "Content-Type: application/json" \
    -d "{\"verification_token\":\"${verification_token}\"}"
  echo
fi

echo "Logging in..."
login_response="$(curl -sS -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"user_name\":\"${USER_NAME}\",\"user_password\":\"${PASSWORD}\"}")"
echo "${login_response}"

if [[ -n "${refresh_token}" ]]; then
  echo "Refreshing token..."
  refresh_response="$(curl -sS -X POST "${BASE_URL}/auth/refresh-token" \
    -H "Content-Type: application/json" \
    -d "{\"refresh_token\":\"${refresh_token}\"}")"
  echo "${refresh_response}"
  echo
  rotated_refresh_token="$(echo "${refresh_response}" | sed -n 's/.*"refresh_token":"\([^"]*\)".*/\1/p')"
  if [[ -n "${rotated_refresh_token}" ]]; then
    refresh_token="${rotated_refresh_token}"
  fi

  echo "Logging out..."
  curl -sS -X POST "${BASE_URL}/auth/logout" \
    -H "Content-Type: application/json" \
    -d "{\"refresh_token\":\"${refresh_token}\"}"
  echo
fi

echo "Forgot password..."
forgot_response="$(curl -sS -X POST "${BASE_URL}/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${EMAIL}\"}")"
echo "${forgot_response}"

reset_token="$(echo "${forgot_response}" | sed -n 's/.*"reset_token":"\([^"]*\)".*/\1/p')"
if [[ -n "${reset_token}" ]]; then
  echo "Resetting password..."
  curl -sS -X POST "${BASE_URL}/auth/reset-password" \
    -H "Content-Type: application/json" \
    -d "{\"reset_token\":\"${reset_token}\",\"new_password\":\"${PASSWORD}\"}"
  echo
fi

echo "Auth smoke completed."
