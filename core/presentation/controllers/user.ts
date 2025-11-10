import { apiReadUserByIdUC } from "@log-ui/core/application/usecases/entities/user"
import { getCookiesUC } from "@log-ui/core/application/usecases/services/auth"

export const userInCookiesUC = async () => {
    try {
        const cookies = await getCookiesUC()
        if (!cookies || !cookies.ctx) return null
        
        // Obtener datos completos del usuario desde el backend
        const userData = await apiReadUserByIdUC(cookies.ctx.id)
        if (!userData || !userData.success) return null
        
        return {
            id: userData.data.id,
            nick: userData.data.nick,
            img: userData.data.img,
            email: userData.data.email,
            address: userData.data.address,
            role: userData.data.role,
            isVerified: userData.data.isVerified,
            solicitud: userData.data.solicitud
        }
    } catch (error) {
        console.error("Error fetching user from cookies:", error)
        return null
    }
}
