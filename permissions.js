import mongoose from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2';

const permissionSchema = new mongoose.Schema(
  {
   
    subAdminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      trim: true,
    },
    read: {
        type: [String],
        enum: ['user', 'campaign','callhistory','support','credential','subscription','plan','subadmin','contactrequest','addon','cms'],
      trim: true,
    },
    write: {
        type: [String],
        enum: ['user', 'campaign','callhistory','support','credential','subscription','plan','subadmin','contactrequest','addon','cms'],
      trim: true,
    },
    delete: {
        type: [String],
        enum: ['user', 'campaign','callhistory','support','credential','subscription','plan','subadmin','contactrequest','addon','cms'],
        trim: true,
      },
      dashboard: {
        type: [String],
        enum: ['recentsubscription', 'subscriptionoverview','callhistory','totalrecords'],
        trim: true,
      },
  },
  {
    timestamps: true,
  }
);

permissionSchema.plugin(mongoosePaginate);


const Permission = mongoose.model("Permission", permissionSchema);
export default Permission;
