import { Request, Response, NextFunction } from 'express'
import supabase from '../lib/supabaseClient'
import { sendSuccess, sendError } from '../utils/response'

export const getSetting = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const key = req.params.key
        const { data, error } = await supabase.from('site_settings').select('key, value').eq('key', key).single()
        if (error) {
            return next(error)
        }
        // return value directly for simplicity
        return sendSuccess(res, data ? data.value : null)
    } catch (err) {
        next(err)
    }
}

export const upsertSetting = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const key = req.params.key
        const { value } = req.body
        const { data, error } = await supabase.from('site_settings').upsert({ key, value }).select().single()
        if (error) {
            return next(error)
        }
        return sendSuccess(res, data)
    } catch (err) {
        next(err)
    }
}

export default {
    getSetting,
    upsertSetting
}
