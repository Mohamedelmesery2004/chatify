import statusCode from "http-status";
import { updateProfilePicture as updateProfilePictureService, updateName as updateNameService , updateEmail as updateEmailService , updateBio as updateBioService } from "../services/updateProfile.service.js";
import expressAsyncHandler from "express-async-handler";
export const updateProfilePicture = expressAsyncHandler(async (req, res) => {
    const { profPic } = req.body;
    if (!profPic) {
      return res
        .status(statusCode.BAD_REQUEST)
        .json({success:false , data:[{ msg: "the field is required" }] });
    }
    const result = await updateProfilePictureService(req.user._id, profPic);
    if (!result.ok) {
      return res.status(statusCode.BAD_REQUEST).json({success:false , data:[{ msg: "the field is required" }] });
    }
    return res.status(statusCode.OK).json({success:true , data :[result.user]});
  });   

export const updateName = expressAsyncHandler(async (req, res) => {
    const { fullName } = req.body;
    if (!fullName) {
      return res
        .status(statusCode.BAD_REQUEST)
        .json({success:false , data:[{ msg: "the field is required" }] });
    }
    const result = await updateNameService(req.user._id, fullName);
    if (!result.ok) {
      return res.status(statusCode.BAD_REQUEST).json({success:false , data:[{ msg: "the field is required" }] });
    }
    return res.status(statusCode.OK).json({success:true , data :[result.user]});
  });

  export const updateEmail = expressAsyncHandler(async(req,res)=>{
    const {email}=req.body;
    const result = await updateEmailService(req.user._id, email);
    if (!result.ok) {
      const msg =
        result.reason === "EMAIL_IN_USE"
          ? "This email is already used"
          : "INVALID_EMAIL";
      return res.status(statusCode.BAD_REQUEST).json({ success: false,data:[ { message: msg } ]});
    }
    return res.status(statusCode.OK).json({success:true , data :[result.user]});
  })

  export const updateBio = expressAsyncHandler(async(req,res)=>{
    const {bio}=req.body;
    if(!bio)
    {
      return res.status(statusCode.BAD_REQUEST).json({success:false , data:[{ msg: "the field is required" }] });
    }
    const result = await updateBioService(req.user._id, bio);
    if(!result.ok)
    {
      return res.status(statusCode.BAD_REQUEST).json({success:false , data:[{ msg: "the field is required" }] });
    }
    return res.status(statusCode.OK).json({success:true , data :[result.user]});
  })