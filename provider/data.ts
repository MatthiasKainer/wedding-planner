import * as models from '../model/admin';
import * as mongoose  from 'mongoose';

let mongo = process.env.MONGO_CONNECTION || "mongodb://localhost/hochzeit";
mongoose.connect(mongo);

export var inviteeSchema = new mongoose.Schema({
        _id : String,
        name : String,
        contact : String,
        people : String,
        code : String,
        coming : String,
        hotelRange : String,
        hotelRequired : Boolean
    });

export interface IInviteePack extends mongoose.Document {
    name: string;
    contact : string;
    people : string;
    code : string;
    coming : string;
    hotelRange : string;
    hotelRequired : boolean;
}

export class Map {
    public static toIInviteePack(inviteeModel : models.InviteePack) : IInviteePack {
        if (!inviteeModel) return null;
        let model = mongoose.model<IInviteePack>("invitees", inviteeSchema);
        return new model({
            _id : inviteeModel.name,
            name : inviteeModel.name,
            contact : inviteeModel.contact,
            people : inviteeModel.people.join(','),
            code : inviteeModel.code,
            coming : inviteeModel.coming,
            hotelRange : inviteeModel.hotelRange,
            hotelRequired : inviteeModel.hotelRequired
        });
    }    
    
    public static toInviteePack(pack : IInviteePack) : models.InviteePack {
        if (!pack) return null;
        let model = new models.InviteePack(pack.name);
        pack.people.split(',').forEach(_ => model.addName(_));
        model.code = pack.code;
        model.coming = pack.coming;
        model.contact = pack.contact;
        model.hotelRange = pack.hotelRange;
        model.hotelRequired = pack.hotelRequired;
        return model;
    }
}
 
export var repository = mongoose.model<IInviteePack>("Invitees", inviteeSchema);