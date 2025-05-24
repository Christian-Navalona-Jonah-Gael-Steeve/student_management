const toStudentDto = (user) => {
    const { _id, firstName, lastName, email } = user
    return {
        _id,
        firstName,
        lastName,
        email
    }
}

module.exports = {
    toStudentDto,
}