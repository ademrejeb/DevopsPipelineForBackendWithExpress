import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../../app';

chai.use(chaiHttp);
chai.should();

describe('GET /Tournament/getall', async () => {
    await it("should get all tournaments ",async (done) => {
        await chai.request(app)
            .get('/Tournament/getall')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                done();
            });
    });

});
