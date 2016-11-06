"use strict";
var services = require("../service/participants");
var models = require("../model/admin");
var user = (function () {
    function user() {
    }
    user.get = function (req) {
        var invitee = req.session.user;
        return invitee;
    };
    user.set = function (req, invitee) {
        req.session.user = invitee;
    };
    return user;
}());
var VisitorController = (function () {
    function VisitorController(guestListService) {
        if (guestListService === void 0) { guestListService = new services.GuestListService(); }
        this.guestListService = guestListService;
    }
    VisitorController.prototype.view = function (req, res) {
        var invitee = user.get(req);
        if (!invitee)
            return res.render('login');
        res.render('visitors', {
            invitee: {
                name: invitee.name,
                people: invitee.people.map(function (_) { return _.replace(/\[K\]/gi, ''); }),
                hasAnswered: invitee.coming != models.AcceptanceState.UNKNOWN,
                isComing: invitee.coming == models.AcceptanceState.COMING,
                hotelRange: invitee.hotelRange,
                hotelRequired: invitee.hotelRequired
            }
        });
    };
    return VisitorController;
}());
exports.VisitorController = VisitorController;
var AttendenceController = (function () {
    function AttendenceController(guestListService) {
        if (guestListService === void 0) { guestListService = new services.GuestListService(); }
        this.guestListService = guestListService;
        this.adminController = new AdminController(this.guestListService);
    }
    AttendenceController.prototype.result = function (req, res, invitee, error) {
        user.set(req, invitee);
        if (!error)
            return res.redirect('/');
        res.render('visitors', {
            invitee: {
                error: error,
                name: invitee.name,
                people: invitee.people.map(function (_) { return _.replace(/\[K\]/gi, ''); }),
                hasAnswered: invitee.coming != models.AcceptanceState.UNKNOWN
            }
        });
    };
    AttendenceController.prototype.attend = function (req, res) {
        var _this = this;
        var invitee = user.get(req);
        if (!invitee)
            res.redirect('/');
        this.guestListService.get(invitee.name, function (err, item) {
            _this.guestListService.edit(invitee.name, item.accept(), function (err) {
                _this.result(req, res, item, err);
            });
        });
    };
    AttendenceController.prototype.attendCustom = function (req, res) {
        var _this = this;
        var invitee = user.get(req);
        if (!invitee)
            res.redirect('/');
        this.guestListService.get(invitee.name, function (err, item) {
            item.people = [];
            var erwachsene = req.body.Erwachsene.split(',');
            var kinder = req.body.Kinder.split(',');
            erwachsene.forEach(function (_) { return item.addName(_.trim()); });
            kinder.forEach(function (_) { return item.addName(_.trim() + " [K]"); });
            item.hotelRange = req.body.hotelRange;
            item.hotelRequired = req.body.hotelRequired;
            _this.guestListService.edit(invitee.name, item.accept(), function (err) {
                _this.result(req, res, item, err);
            });
        });
    };
    AttendenceController.prototype.nay = function (req, res) {
        var _this = this;
        var invitee = user.get(req);
        if (!invitee)
            res.redirect('/');
        this.guestListService.get(invitee.name, function (err, item) {
            _this.guestListService.edit(invitee.name, item.nay(), function (err) {
                _this.result(req, res, item, err);
            });
        });
    };
    return AttendenceController;
}());
exports.AttendenceController = AttendenceController;
var AdminController = (function () {
    function AdminController(guestListService) {
        if (guestListService === void 0) { guestListService = new services.GuestListService(); }
        this.guestListService = guestListService;
    }
    AdminController.prototype.list = function (res, err, guestList) {
        var guestListMap = {
            err: err,
            invitees: guestList.invitees,
            total: guestList.totalPeople(),
            accepted: guestList.totalAccepted()
        };
        res.render('admin', guestListMap);
    };
    AdminController.prototype.all = function (req, res) {
        var _this = this;
        var guestList = this.guestListService.all(function (err, guestList) {
            _this.list(res, err, guestList);
        });
    };
    AdminController.prototype.edit = function (req, res) {
        var _this = this;
        this.guestListService.get(req.body.name, function (err, model) {
            model.people = [];
            req.body.people.split(',').forEach(function (_) { return model.addName(_.trim()); });
            if (req.body.coming.toLocaleLowerCase() == models.AcceptanceState.COMING.toLocaleLowerCase())
                model.accept();
            else if (req.body.coming.toLocaleLowerCase() == models.AcceptanceState.NAYSAYERS.toLocaleLowerCase())
                model.nay();
            else
                model.coming = models.AcceptanceState.UNKNOWN;
            model.hotelRequired = req.body.hotelRequired;
            model.hotelRange = req.body.hotelRange;
            _this.guestListService.edit(req.body.name, model, function (err) {
                res.redirect('/admin');
            });
        });
    };
    AdminController.prototype.addInvitee = function (req, res) {
        this.guestListService.add(req.body.name, req.body.people, function (err) {
            if (err)
                console.error(err);
            res.redirect('/admin?saved=true');
        });
    };
    return AdminController;
}());
exports.AdminController = AdminController;
var AuthController = (function () {
    function AuthController(guestListService) {
        if (guestListService === void 0) { guestListService = new services.GuestListService(); }
        this.valid_codes = ["20. März 2017", "20. Mai 2017"];
        this.admin_codes = ["Z2ievson?", "Tes1-Adm1n-Access-42"];
        this.guestListService = guestListService;
    }
    AuthController.prototype.authenticate = function (req, res, onDone) {
        var _this = this;
        this.guestListService.getByCode(req.body.code, function (err, invitee) {
            req.session.isAdmin = _this.admin_codes.some(function (item) { return item === req.body.code; });
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
    };
    AuthController.prototype.isAuthenticated = function (req) {
        return req.session.isAuthenticated;
    };
    AuthController.prototype.isAdmin = function (req) {
        return req.session.isAdmin;
    };
    return AuthController;
}());
exports.AuthController = AuthController;
//# sourceMappingURL=controller.js.map