import { UserRole } from "../generated/prisma/index.js";
import { db } from "../libs/db.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'

const registerUser = async (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({
      message: "All Fields are required",
    });
  }

  try {
    const existingUser = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User Already Exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await db.user.create({
        data: {
            email,
            password: hashedPassword,
            name: username,
            role: UserRole.USER
        }
    })

    if(!newUser){
        return res.status(500).json({
            message: "Error Creating new user"
        })
    }
    
    const token = jwt.sign({id:newUser.id}, process.env.JWT_SECRET, {expiresIn: '7d'})
    const cookieOptions = {
        httpOnly: true,
        secure:  process.env.NODE_ENV === 'production',
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 Days
    }

    res.cookie('token', token, cookieOptions)

    res.status(201).json({
      success: true,
        message: "User Registered Successfully",
        user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            image: newUser.image
        }
    })

  } catch (error) {
    console.log("Error Creating user", error);
     res.status(500).json({
      success: false,
        message: "Error creating in User"
     })
    
  }
};

const loginUser = async (req, res) => {
  const {email, password} = req.body
  try {
    if(!email || !password){
      return res.status(400).json({
        message: "All fields are required"
      })
    }
    
    const user = await db.user.findUnique({
      where: {
        email
      }
    })

    if(!user){
      return res.status(400).json({
        message: "User not found"
      })
    }
    console.log(user);
    
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
      return res.status(401).json({
        message: "Invalid Credentials"
      })
    }

    const token = jwt.sign({id: user.id}, process.env.JWT_SECRET, {expiresIn: "7d"})

    const cookieOptions= {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7
    }

    res.cookie('token', token, cookieOptions)

    res.status(200).json({
      success: true,
      message: "User Logged in Successfully",
      user: {
        id: user.id,
        emal: user.email,
        name: user.name,
        role: user.role,
        image: user.image
      }
    })

    }

   catch (error) {
    console.log("Error in logging in user", error.message);
    res.status(500).json({
      success: false,
      message: "Error in Logging in user"
    })
  
  }
}

const logoutUser = async (req, res) => {
    try {
      res.clearCookie("token", {
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7
      })
  
      res.status(200).json({
        success: true,
        message: "User Logged Out successfully"
      })
    } catch (error) {
      console.log("Error logging out user", error.message);
      res.status(500).json({
        success: false,
        message: "Error logging out user"
      })
      
    }
};

const checkUser = async (req, res) => {
  try {
    res.status(200).json({
      success:true,
      message: "User authenticated successsfully",
      user: req.user
    })
  } catch (error) {
    console.log("Error checking user:", error);
    res.status(500).json({
      error: "Error checking user"
    })
    
  }
};

export { registerUser, loginUser, logoutUser, checkUser };
