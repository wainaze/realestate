/**
 * Created by Sergey on 12/01/2016.
 */
var Promise = require('bluebird');
var db = azurent.db; // FIXME controller should not talk to db directly

function renderProblems(req, res) {
    var data = {status : {}}
    Promise.join(
        db.issues.getAllUnsolvedIssues(req.user.id),
        db.issues.getAllSolvedIssues(req.user.id),
        function(unsolvedIssues, solvedIssues){
            data.user = req.user;
            data.status.totalNewIssues = req.data.status.newIssuesCount;
            data.status.unreadMessagesCount = req.data.status.unreadMessagesCount;
            data.openIssues = unsolvedIssues;
            data.solvedIssues = solvedIssues;
            res.render('problems', data);
        }
    );
}

function renderProblem(req, res) {
    var data = { status : {}};
    var issueId = parseInt(req.query.issueId);
    db.issues.getIssue(issueId)
        .then(function(issue){
            data.user = req.user;
            data.status.totalNewIssues = req.data.status.newIssuesCount;
            data.status.unreadMessagesCount = req.data.status.unreadMessagesCount;
            data.issue = issue;
            data.costs = issue.costs;
            if (data.issue) {
                if (data.issue.status == 'new') {
                    db.issues.updateIssueStatus(req.user.id, issueId, 'open');
                    data.issue.status = 'open';
                }
                res.render('problem', data);
            } else {
                res.redirect('problems.html');
            }
        });
}

function renderAddProblem(req, res) {
    var data = {status : {}};
    data.user = req.user;
    data.status.totalNewIssues = req.data.status.newIssuesCount;
    data.status.unreadMessagesCount = req.data.status.unreadMessagesCount;
    res.render('addIssue',data);
}

function processAddCost(req, res) {
    var userId = parseInt(req.user.id);
    var issueId = parseInt(req.body.issueId);
    var costDescription = req.body.costDescription;
    var costAmount = req.body.costAmount;
    db.issues.addCost(issueId, userId, costAmount, costDescription)
        .then(function() {
                res.send('ok');
            }
        )
        .catch(function(err){
                res.send('error');
            }
        );
}

function processAddComment(req, res) {
    var userId = parseInt(req.user.id);
    var issueId = parseInt(req.body.issueId);
    var commentText = req.body.commentText;
    if (!commentText || !commentText.length)
        res.send('ok');

    db.issues.addComment(userId, issueId, commentText)
        .then(function(){
            res.send('ok');
        })
        .catch(function(err){
            res.send(err);
        });
}

function processAddProblem(req, res){
    var userId = parseInt(req.user.id);
    var subject = req.body.issueSubject;
    var description = req.body.issueDescription;
    var propertyId = parseInt(req.body.issueProperty);
    db.issues.addIssue(userId, subject, description, propertyId)
        .then(function(issue){
            res.send( issue.id.toString());
        })
        .catch(function(err){
            res.send(err);
        })
}

function processIssueSolved(req, res) {
    var userId = parseInt(req.user.id);
    var issueId = parseInt(req.body.issueId);
    db.issues.updateIssueStatus(userId, issueId, 'solved')
        .then(function(){
            res.send('ok');
        })
        .catch(function(err){
            res.send(err);
        });
}

function processIssueOnHold(req, res) {
    var userId = parseInt(req.user.id);
    var issueId = parseInt(req.body.issueId);
    db.issues.updateIssueStatus(userId, issueId, 'on-hold')
        .then(function(){
            res.send('ok');
        })
        .catch(function(err){
            res.send(err);
        });
}

function processIssueRejected(req, res) {
    var userId = parseInt(req.user.id);
    var issueId = parseInt(req.body.issueId);
    db.issues.updateIssueStatus(userId, issueId, 'rejected')
        .then(function(){
            res.send('ok');
        })
        .catch(function(err){
            res.send(err);
        });
}

function processIssueReopend(req, res) {
    var userId = parseInt(req.user.id);
    var issueId = parseInt(req.body.issueId);
    db.issues.updateIssueStatus(userId, issueId, 'open')
        .then(function(){
            res.send('ok');
        })
        .catch(function(err){
            res.send(err);
        });
}

exports.renderProblems = renderProblems;
exports.renderProblem = renderProblem;
exports.renderAddProblem = renderAddProblem;
exports.processAddCost = processAddCost;
exports.processAddComment = processAddComment;
exports.processAddProblem = processAddProblem;
exports.processIssueSolved = processIssueSolved;
exports.processIssueOnHold = processIssueOnHold;
exports.processIssueRejected = processIssueRejected;
exports.processIssueReopend = processIssueReopend;