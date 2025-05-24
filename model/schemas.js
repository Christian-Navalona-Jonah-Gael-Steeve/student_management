const Roles = require('../constants/roles')
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: [Roles.ADMIN, Roles.SCOLARITE, Roles.STUDENT],
      required: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    discriminatorKey: "role",
  }
);

UserSchema.statics.findByEmail = function (email) {
  return this.findOne({ email });
};

const User = mongoose.model("User", UserSchema);

// Student schema extending UserSchema (for future extensibility)
const StudentSchema = Schema({});
const Student = User.discriminator(Roles.STUDENT, StudentSchema);

const CourseSchema = Schema({
  name: String,
  code: String,
});
const Course = mongoose.model("Course", CourseSchema);

const GradeSchema = Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  grade: Number,
  date: String,
});
const Grade = mongoose.model("Grade", GradeSchema);

// Exports the modeles
module.exports = {
  User,
  Student,
  Course,
  Grade,
};
