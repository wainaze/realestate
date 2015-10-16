var records = [
    {propertyId: 1, month: 'October', monthId: 10, dueDate: '7/10/2015', payedDate: '7/10/2015', payment: 600 },
    {propertyId: 1, month: 'September', monthId: 9, dueDate: '7/09/2015', payedDate: '7/09/2015', payment: 600 },
    {propertyId: 1, month: 'August', monthId: 8, dueDate: '7/08/2015', payedDate: '7/08/2015', payment: 600 },
    {propertyId: 1, month: 'July', monthId: 7, dueDate: '7/07/2015', payedDate: '7/07/2015', payment: 600 },
    {propertyId: 1, month: 'June', monthId: 6, dueDate: '7/06/2015', payedDate: '7/06/2015', payment: 600 },
    {propertyId: 1, month: 'May', monthId: 5, dueDate: '7/05/2015', payedDate: '7/05/2015', payment: 600 },
    {propertyId: 1, month: 'April', monthId: 4, dueDate: '7/04/2015', payedDate: '7/04/2015', payment: 600 },
    {propertyId: 1, month: 'March', monthId: 3, dueDate: '7/03/2015', payedDate: '7/03/2015', payment: 600 },
    {propertyId: 1, month: 'February', monthId: 2, dueDate: '7/02/2015', payedDate: '7/02/2015', payment: 600 },
    {propertyId: 1, month: 'January', monthId: 1, dueDate: '7/01/2015', payedDate: '7/01/2015', payment: 600 },
    {propertyId: 1, month: 'December', monthId: 0, dueDate: '7/12/2015', payedDate: '7/12/2015', payment: 600 },
    {propertyId: 1, month: 'November', monthId: -1, dueDate: '7/11/2015', payedDate: '7/11/2015', payment: 600 }
];

exports.geyPayments = function(propertyId){
        return records.filter(function(value){
            return value.propertyId == propertyId;
        });
    }
