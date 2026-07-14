import type { UserData } from "@/mocks/fixtures/data";

function toLoginResponse(user: UserData, token: string) {
  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
    },
  };
}

function toMeResponse(user: UserData) {
  return {
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
    },
  };
}

export { toLoginResponse, toMeResponse };
