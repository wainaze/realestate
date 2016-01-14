/**
 * Created by Sergey on 14/01/2016.
 */
var db = azurent.db;

function renderProblems(req, res) {
    var property = req.property;
    db.issues.getOpenIssuesForProperty(property.id)
        .then(function(issues){
            res.render('tenant/problems', {
                user: req.user,
                status: { unreadMessagesCount : req.data.status.unreadMessagesCount },
                issues: issues
            });
        });
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
                res.render('tenant/problem', data);
            } else {
                res.redirect('problems.html');
            }
        });
}

function renderAddProblem(req, res) {
    var property = req.property;
    var data = {status : {}};
    data.user = req.user;
    data.status.totalNewIssues = req.data.status.newIssuesCount;
    data.status.unreadMessagesCount = req.data.status.unreadMessagesCount;
    data.property = property;
    res.render('tenant/addIssue', data);
}

exports.renderProblems = renderProblems;
exports.renderProblem = renderProblem;
exports.renderAddProblem = renderAddProblem;