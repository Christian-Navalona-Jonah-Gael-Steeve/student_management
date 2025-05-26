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
    const { _id, firstName, lastName, email, isActive, isVerified, role } = user;
    return {
        _id,
        firstName,
        lastName,
        email,
        isActive,
        isVerified,
        role
    };
};

module.exports = {
    toUserDto,
    toStudentDto,
}
