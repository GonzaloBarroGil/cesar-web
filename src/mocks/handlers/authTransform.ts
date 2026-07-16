import type { UserData } from "@/mocks/fixtures/data";

function toLoginResponse(user: UserData, token: string) {
  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      consorcio_id: user.consorcio_id,
      nombre_completo: user.nombre_completo,
    },
  };
}

function toMeResponse(user: UserData) {
  return {
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      consorcio_id: user.consorcio_id,
      nombre_completo: user.nombre_completo,
    },
  };
}

export { toLoginResponse, toMeResponse };
