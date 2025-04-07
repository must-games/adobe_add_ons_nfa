import { userData } from './userFunc'

let gUserData: userData = {
    id: null,
    userRole: null,
    email: null,
    imagesGeneratedToday: 0,
    imagesGeneratedTotal: 0,
}

export async function getUser() {
    gUserData.id = await getPseudoUserId()
    gUserData.userRole = 'OWNER'
    gUserData.email = 'guest'
    return gUserData
}

const getPseudoUserId = async () => {
    return 'test_user_0001'
}
