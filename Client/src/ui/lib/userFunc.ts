export type userData = {
    id: string | null
    userRole: string | null
    email: string | null
    imagesGeneratedToday: number | 0
    imagesGeneratedTotal: number | 0
}

export function isAdmin(userData: userData) {
    if (userData.userRole == 'OWNER' || userData.userRole == 'ADMIN') {
        return true
    }

    return false
}
