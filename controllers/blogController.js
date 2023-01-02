const { Blog, validate } = require("../models/blogModel");
const { User } = require("../models/userModel");
const { cloudinary } = require("../config/cloudinaryConfig");
const sgMail = require("@sendgrid/mail");
const { errorMsg, successMsg } = require("../utils/response");

// desc   Create new Blog
// route  POST /api/blogs
// access Private
const createBlog = async (req, res) => {
  try {
    let { title, content, status } = req.body;
    console.log(req.body);
    let main = { title, content, status };

    if (!req.files) return res.send("Please upload an image");
    let { image } = req.files;

    const fileTypes = ["image/jpeg", "image/jpg", "image/png"];
    const imageSize = 1024;

    if (!fileTypes.includes(image.mimetype)) {
      return errorMsg(res, "Only jpeg, jpg and png files are allowed.", 400);
    }

    if (image.size > imageSize * 1024) {
      return errorMsg(res, "Image size should be less than 1MB.", 400);
    }

    const cloudFile = await cloudinary.uploader.upload(image.tempFilePath, {
      folder: "blogs",
    });

    const { error } = validate(main);
    if (error) return errorMsg(res, error.details[0].message, 400);

    const blog = new Blog({
      title,
      content,
      image: cloudFile.secure_url,
      status,
      date: Date.now(),
    });

    await blog.save();

    successMsg(res, "Blog created successfully.", blog, 201);
  } catch (error) {
    errorMsg(res, error.message, 500);
  }
};

// desc   Get all blogs
// route  GET /api/blogs
// access Public
const getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find();

    successMsg(res, "All blogs.", blogs, 200);
  } catch (error) {
    errorMsg(res, error.message, 500);
  }
};

// desc   Get single blog
// route  GET /api/blogs/:id
// access Public
const getSingleBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) return errorMsg(res, "Blog not found.", 404);

    successMsg(res, "Single blog.", blog, 200);
  } catch (error) {
    errorMsg(res, error.message, 500);
  }
};

// desc   Update single blog
// route  PUT /api/blogs/:id
// access Private
const updateBlog = async (req, res) => {
  try {
    let { title, description, status } = req.body;
    let main = { title, description, status };

    // reference user with user name
    let { user } = req.body;
    // let user = await User.findOne({
    //     name: user
    // });

    if (!user) return errorMsg(res, "User not found.", 404);
    console.log(user);

    // main.user = userRef._id;

    if (!req.files) return res.send("Please upload an image");
    let { image } = req.files;

    const fileTypes = ["image/jpeg", "image/jpg", "image/png"];
    const imageSize = 1024;

    if (!fileTypes.includes(image.mimetype)) {
      return errorMsg(res, "Only jpeg, jpg and png files are allowed.", 400);
    }

    if (image.size > imageSize * 1024) {
      return errorMsg(res, "Image size should be less than 1MB.", 400);
    }

    const cloudFile = await cloudinary.uploader.upload(image.tempFilePath, {
      folder: "blogs",
    });

    const { error } = validate(main);
    if (error) return errorMsg(res, error.details[0].message, 400);

    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        image: cloudFile.secure_url,
        user: user.name,
        status,
      },
      { new: true }
    );

    if (!blog) return errorMsg(res, "Blog not found.", 404);

    successMsg(res, "Blog updated successfully.", blog, 200);
  } catch (error) {
    errorMsg(res, error.message, 500);
  }
};

// desc   Delete single blog
// route  DELETE /api/blogs/:id
// access Private
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);

    if (!blog) return errorMsg(res, "Blog not found.", 404);

    successMsg(res, "Blog deleted successfully.", blog, 200);
  } catch (error) {
    errorMsg(res, error.message, 500);
  }
};

// desc  Send blog to user email
// route  POST /api/blogs/send
// access Private
const sendBlog = async (req, res) => {
  try {
    const { email, blogId } = req.body;

    const blog = await Blog.findById(blogId);

    if (!blog) return errorMsg(res, "Blog not found.", 404);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Blog",
      html: `<h1>${blog.title}</h1>
            <p>${blog.description}</p>
            <img src=${blog.image} alt="blog image" />`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return errorMsg(res, "Something went wrong.", 500);
      } else {
        console.log("Email sent: " + info.response);
        successMsg(res, "Email sent successfully.", null, 200);
      }
    });
  } catch (error) {
    errorMsg(res, error.message, 500);
  }
};

// desc  Send blog to all users email
// route  POST /api/blogs/send/:id
// access Private
const sendAllBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) return errorMsg(res, "Blog not found.", 404);

    const users = await User.find();

    if (!users) return errorMsg(res, "Users not found.", 404);

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    users.forEach(async (user) => {
      const msg = {
        to: user.email,
        from: "basitolaitan27@gmail.com",
        subject: "Blog",
        html: `<h1>${blog.title}</h1>
            <p>${blog.description}</p>
            <img src=${blog.image} alt="blog image" />`,
      };

      await sgMail.send(msg).then(
        () => {},
        (error) => {
          console.error(error);

          if (error.response) {
            console.error(error.response.body);
          }
        }
      );
    });

    // const msg = {
    //   to: users.map((user) => user.email),
    //   from: {
    //     email: "basitolaitan27@gmail.com",
    //     name: process.env.NAME,
    //   },
    //   subject: "Blog",
    //   html: `<h1>${blog.title}</h1>
    //         <p>${blog.content}</p>
    //         <img src=${blog.image} alt="blog image" />`,
    // };

    // sgMail.send(msg).then(
    //   () => {},
    //   (error) => {
    //     if (error) {
    //       console.error(error);

    //       if (error.response) {
    //         console.error(error.response.body);
    //       }
    //     }
    //   }
    // );

    successMsg(res, "Email sent successfully.", null, 200);
  } catch (error) {
    errorMsg(res, error.message, 500);
  }
};

module.exports = {
  createBlog,
  getAllBlogs,
  getSingleBlog,
  updateBlog,
  deleteBlog,
  sendBlog,
  sendAllBlog,
};
