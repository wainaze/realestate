/**
 * Created by Sergey on 24/01/2016.
 */
db.contracts.find().forEach(function(contract){
    contract.id = ''+contract.id;
    contract.propertyId = ''+contract.propertyId;
    db.contracts.save(contract);
});

db.issues.find().forEach(function(issue){
    issue.issuePropertyId = ''+issue.issuePropertyId;
    db.issues.save(issue);
});

db.payments.find().forEach(function(payment){
    payment.contractId = ''+payment.contractId;
    payment.propertyId = ''+payment.propertyId;
    db.payments.save(payment);
});

db.properties.find().forEach(function(property){
    property.id = ''+property.id;
    db.properties.save(property);
});

db.transactions.find().forEach(function(transaction){
    transaction.propertyId = ''+transaction.propertyId;
    db.transactions.save(transaction);
});