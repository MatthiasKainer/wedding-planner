import * as models from "../model/admin";
import * as data from "../provider/data";

export class GuestListService {
    static guestList = new models.GuestList();
    repository = data.repository;
    
    public all(onFind : (err : Error, res? : models.GuestList) => void) {
        return this.repository.find({}, (err, res) => {
            if (err) return onFind(err);
            let guests = new models.GuestList();
            res.map(_ => data.Map.toInviteePack(_))
                .forEach(_ => guests.addInvitees(_));
            onFind(null, guests);
        });
    }
    
    public get(name : string, onFind : (err : Error, res? : models.InviteePack) => void) {
        return this.repository.findOne({ _id : name }, (err, res) => {
            if (err) return onFind(err);
            onFind(null, data.Map.toInviteePack(res));
        });
    }
    
    private codeGen(pack : models.InviteePack, onDone : () => void) {
        this.repository.count({ code : pack.code}, (err, count) => {
            if (count > 0) {
                pack.generateCode();
                return this.codeGen(pack, onDone);
            }
            
            onDone();
        });
    }
    
    public add(name : string, people : string, onDone : (err : Error) => void) {
        let pack = new models.InviteePack(name);
        people.split(',').forEach(_ => pack.addName(_));
        pack.hotelRequired=true;
        pack.hotelRange="Freitag, 19.5. bis Sonntag 21.5.";        
        this.codeGen(pack, () => {
            this.repository.create(data.Map.toIInviteePack(pack), (err) => onDone(err));
        });
    }
    
    public edit(name : string, model : models.InviteePack, onDone : (err : Error) => void) {
        this.repository.update({ _id : name }, model, (err) => onDone(err));
    }
    
    public getByCode(code : string, onDone : (err : Error, res? : models.InviteePack) => void) {
        this.repository.findOne({ code : code }, (err, res) => {
            onDone(err, data.Map.toInviteePack(res));
        });
    }
}