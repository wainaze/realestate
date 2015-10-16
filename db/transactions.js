var records = [
	{id:1, date: '01/05/2015', amount: 600, userId: 1, propertyId: 1},
	{id:1, date: '01/06/2015', amount: 600, userId: 1, propertyId: 1},
	{id:1, date: '01/07/2015', amount: 600, userId: 1, propertyId: 1},
	{id:1, date: '01/08/2015', amount: 600, userId: 1, propertyId: 1},
	{id:1, date: '01/09/2015', amount: 600, userId: 1, propertyId: 1},
	{id:1, date: '01/10/2015', amount: 600, userId: 1, propertyId: 1},
]

exports.getAllPayments = function(userId){
	return records.filter(function(transaction){
		return transaction.userId == userId;
	});
}