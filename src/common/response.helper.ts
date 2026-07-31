import { Response } from "express";
import common from "./index"

export default {
    success: (res: Response, data:any, message?:string) => {
        return res.status(common.SUCCESS).send({
            success: true,
            data: data ?? [],
            message: message ?? common.SUCCESS_MSG
        });
    },
    error: (res: Response, data:any, message:string) => {
        return res.status(common.ERROR).send({
            success: true,
            data: data ?? [],
            message: message ?? common.SUCCESS_MSG
        });
    },
    unauthorized: (res: Response, data?:any, message?:string) => {
        return res.status(common.UNAUTHORIZED).send({
            success: false,
            data: data ?? [],
            message: message ?? 'Not Authorized'
        });
    },
    badReq: (res: Response, data:any, message:string) => {
        return res.status(common.BAD_REQ).send({
            success: false,
            data: data ?? [],
            message: message ?? ''
        });
    },

}
