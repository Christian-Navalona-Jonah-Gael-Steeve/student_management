const toStudentDto = (user) => {
    const { _id, firstName, lastName, email } = user
    return {
        _id,
        firstName,
        lastName,
        email
    }
};

const toUserDto = (user) => {
    const { _id, firstName, lastName, email, isActive, isVerified, role, googleSub, googleEmail } = user;
    return {
        _id,
        firstName,
        lastName,
        email,
        isActive,
        isVerified,
        role,
        googleSub,
        googleEmail
    };
};

module.exports = {
    toUserDto,
    toStudentDto,
}