import * as services from "../service/participants";
import * as models from "../model/admin";

class user {
    public static get(req : any) {
        let invitee : models.InviteePack = req.session.user;
        return invitee;
    }
    public static set(req : any, invitee : models.InviteePack) {
        req.session.user = invitee;
    }
} 

export class VisitorController {
    guestListService : services.GuestListService;
    
    public constructor(guestListService : services.GuestListService = new services.GuestListService()) {
        this.guestListService = guestListService;
    }
    
    public view(req : any, res : any) {   
        let invitee = user.get(req);
        if (!invitee) return res.render('login');
        res.render('visitors', {
            invitee : {
                name : invitee.name,
                people : invitee.people.map(_ => _.replace(/\[K\]/gi, '')),
                hasAnswered : invitee.coming != models.AcceptanceState.UNKNOWN,
                isComing : invitee.coming == models.AcceptanceState.COMING,
                hotelRange : invitee.hotelRange,
                hotelRequired : invitee.hotelRequired
            }
        });
    }
}

export class AttendenceController {
    guestListService : services.GuestListService;
    adminController : AdminController;
    
    public constructor(guestListService : services.GuestListService = new services.GuestListService()) {
        this.guestListService = guestListService;
        this.adminController =  new AdminController(this.guestListService);
    }
    
    private result(req : any, res : any, invitee : models.InviteePack, error? : Error) {
        user.set(req, invitee);
        if (!error) return res.redirect('/');
        res.render('visitors', {
            invitee : {
                error : error,
                name : invitee.name,
                people : invitee.people.map(_ => _.replace(/\[K\]/gi, '')),
                hasAnswered : invitee.coming != models.AcceptanceState.UNKNOWN
            }
        });
    }
    
    public attend(req : any, res : any) {
        let invitee = user.get(req);
        if (!invitee) res.redirect('/');
        this.guestListService.get(invitee.name, (err, item) => {
            this.guestListService.edit(invitee.name, item.accept(), (err) => { 
                this.result(req, res, item, err);
            });
        });
    }
    
    public attendCustom(req : any, res : any) {
        let invitee = user.get(req);
        if (!invitee) res.redirect('/');
        this.guestListService.get(invitee.name, (err, item) => {
            item.people = [];
            let erwachsene : string[] = req.body.Erwachsene.split(',');
            let kinder : string[] = req.body.Kinder.split(',');
            erwachsene.forEach(_ => item.addName(_.trim()));
            kinder.forEach(_ => item.addName(_.trim() + " [K]"));
            item.hotelRange = req.body.hotelRange;
            item.hotelRequired = req.body.hotelRequired;
            this.guestListService.edit(invitee.name, item.accept(), (err) => {
                this.result(req, res, item, err);
            });
        });        
    }
    
    public nay(req : any, res : any) {
        let invitee = user.get(req);
        if (!invitee) res.redirect('/');
        this.guestListService.get(invitee.name, (err, item) => {
            this.guestListService.edit(invitee.name, item.nay(), (err) => { 
                this.result(req, res, item, err);
            });
        });
    }
}

export class AdminController {
    guestListService : services.GuestListService;
    
    public constructor(guestListService : services.GuestListService = new services.GuestListService()) {
        this.guestListService = guestListService;
    }
    
    public list(res : any, err : Error, guestList : models.GuestList) {
        let guestListMap = {
            err : err,
            invitees : guestList.invitees,
            total : guestList.totalPeople(),
            accepted : guestList.totalAccepted()
        }
        res.render('admin', guestListMap);
    }
    
    public all(req : any, res : any) {
        let guestList = this.guestListService.all((err, guestList) => {
            this.list(res, err, guestList);         
        });
    }
    
    public edit(req : any, res : any) {
        this.guestListService.get(req.body.name, (err, model) => {
            model.people = [];
            req.body.people.split(',').forEach((_ : string) => model.addName(_.trim()));
            if (req.body.coming.toLocaleLowerCase() == models.AcceptanceState.COMING.toLocaleLowerCase())
                model.accept();
            else if (req.body.coming.toLocaleLowerCase() == models.AcceptanceState.NAYSAYERS.toLocaleLowerCase())
                model.nay();
            else
                model.coming = models.AcceptanceState.UNKNOWN;
                
            model.hotelRequired = req.body.hotelRequired;
            model.hotelRange = req.body.hotelRange;
            this.guestListService.edit(req.body.name, model, (err) => {
                res.redirect('/admin');  
            });            
        });
    }
    
    public addInvitee(req : any, res : any) {
        this.guestListService.add(req.body.name, req.body.people, (err) => {
            if (err) console.error(err);
            res.redirect('/admin?saved=true');            
        });
    }
} 

export class AuthController {
    valid_codes = ["20. März 2017", "20. Mai 2017"];
    admin_codes = ["Z2ievson?", "Tes1-Adm1n-Access-42"];
    guestListService : services.GuestListService;
    
    public constructor(guestListService : services.GuestListService = new services.GuestListService()) {
        this.guestListService = guestListService;
    }
    
    public authenticate(req : any, res : any, onDone : () => void) {
        this.guestListService.getByCode(req.body.code, (err, invitee) => {
            req.session.isAdmin = this.admin_codes.some(item => item === req.body.code);
            req.session.isAuthenticated = invitee || 
                req.session.isAdmin;
            user.set(req, invitee);
            console.log("User is authenticated: " + req.session.isAuthenticated);
            console.log("User is admin: " + req.session.isAdmin);
            console.log("User is: " + (req.session.isAdmin ? "admin" : req.session.user ? req.session.user.name : "unknown"));
            
            if (req.session.isAdmin)
                res.redirect('/admin');
            else
                res.redirect('/');
        });
        
    }
    
    public isAuthenticated(req : any) {
        return req.session.isAuthenticated;
    }
    
    public isAdmin(req : any) {
        return req.session.isAdmin;
    }
}