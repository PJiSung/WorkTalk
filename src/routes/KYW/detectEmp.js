const Employee = require('../../models/employee');

async function detectEmp(req, res, next) {
    try {
        const empList = await Employee.find();
        res.locals.empList = empList; // 모든 라우트에서 사용할 수 있도록 empList를 로컬 변수로 설정
        next();
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to fetch employee list');
    }
}

module.exports = detectEmp;
