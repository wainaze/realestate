var records = [
	{id:1, date: '07/04/2015', timestamp: '20150407', amount: 600, userId: 1, propertyId: 3},
	{id:2, date: '07/05/2015', timestamp: '20150507', amount: 600, userId: 1, propertyId: 3},
	{id:3, date: '07/06/2015', timestamp: '20150607', amount: 600, userId: 1, propertyId: 3},
	{id:4, date: '07/07/2015', timestamp: '20150707', amount: 600, userId: 1, propertyId: 3},
	{id:5, date: '07/08/2015', timestamp: '20150807', amount: 600, userId: 1, propertyId: 3},
	{id:6, date: '07/11/2014', timestamp: '20141107', amount: 600, userId: 1, propertyId: 1},
	{id:7, date: '07/12/2014', timestamp: '20141207', amount: 600, userId: 1, propertyId: 1},
	{id:8, date: '07/01/2015', timestamp: '20150107', amount: 600, userId: 1, propertyId: 1},
	{id:9, date: '07/02/2015', timestamp: '20150207', amount: 600, userId: 1, propertyId: 1},
	{id:10, date: '07/03/2015', timestamp: '20150307', amount: 600, userId: 1, propertyId: 1},
	{id:11, date: '07/04/2015', timestamp: '20150407', amount: 600, userId: 1, propertyId: 1},
	{id:12, date: '07/05/2015', timestamp: '20150507', amount: 600, userId: 1, propertyId: 1},
	{id:13, date: '07/06/2015', timestamp: '20150607', amount: 600, userId: 1, propertyId: 1},
	{id:14, date: '07/07/2015', timestamp: '20150707', amount: 600, userId: 1, propertyId: 1},
	{id:15, date: '07/08/2015', timestamp: '20150807', amount: 600, userId: 1, propertyId: 1},
	{id:16, date: '07/09/2015', timestamp: '20150907', amount: 600, userId: 1, propertyId: 1},
	{id:17, date: '07/10/2015', timestamp: '20151007', amount: 600, userId: 1, propertyId: 1},
	{id:18, date: '04/05/2015', timestamp: '20150504', amount: -238, userId: 1, propertyId: 1, description: 'Costs for this house'},	
]

exports.getAllPayments = function(userId){
	return records.filter(function(transaction){
		return transaction.userId == userId;
	});
}

exports.getTransaction = function(userId, transactionId) {
	var transaction = records.find(function(value){
		return value.id == transactionId && value.userId == userId;
	});
	if (transaction == 'undefined')
		return null;
	return transaction;
}