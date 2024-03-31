import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../../app';

chai.use(chaiHttp);
chai.should();

describe('GET /User/getall', async () => {
    await it("should get all users ",async (done) => {
        await chai.request(app)
            .get('/User/getall')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                done();
            });
    });

    // it('should return a specific user by ID', async () => {
    //     const res = await chai.request(app).get(`/api/users/${userId}`);
    //     expect(res).to.have.status(200);
    //     expect(res.body).to.be.an('object');
    //     expect(res.body).to.have.property('id').equal(userId);
    // });

});
