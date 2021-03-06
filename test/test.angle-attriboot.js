/* eslint-env node, mocha */

import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

// use 'expect' & sinon-chai
let expect = chai.expect;
chai.use(sinonChai);

// Import the classes.
import AngleAttriboot from '../src/angle-attriboot';

describe('attriboots', () => {

    let attriboot;

    // Helper for easy set-tests
    let _simpleSetterTests = (property, value, badValue) => {
        it('can be changed and fires change events when the value changes', () => {

            var changeEventSpy = sinon.spy();
            attriboot.addEventListener('change', changeEventSpy);
            var propertyChangeEventSpy = sinon.spy();
            attriboot.addEventListener('change:' + property, propertyChangeEventSpy);

            attriboot[property] = value;
            expect(attriboot[property]).to.equal(value);

            expect(changeEventSpy).to.have.callCount(1);
            expect(changeEventSpy).to.have.been.calledWith({
                type: 'change',
                target: attriboot,
                property: property,
                value: value
            });
            expect(propertyChangeEventSpy).to.have.callCount(1);
            expect(propertyChangeEventSpy).to.have.been.calledWith({
                type: 'change:' + property,
                target: attriboot,
                value: value
            });

            // set value again, no events should be fired
            attriboot[property] = value;
            expect(changeEventSpy).to.have.callCount(1);
            expect(propertyChangeEventSpy).to.have.callCount(1);
        });

        it('only accepts correct values', () => {
            expect(() => {
                attriboot[property] = badValue;
            }).to.throw(Error);
        });
    };

    describe('AngleAttriboot', () => {

        beforeEach(() => {
            attriboot = new AngleAttriboot({
                easing: AngleAttriboot.Easing.linear
            });
        });

        it('should have correct default values and working getters', () => {
            let defaultAttriboot = new AngleAttriboot();

            expect(defaultAttriboot.wrap).to.equal(false);
            expect(defaultAttriboot.shortRotation).to.equal(false);
        });

        it('should have correct values when instantiated', () => {
            let attriboot = new AngleAttriboot({
                wrap: true,
                shortRotation: true
            });

            expect(attriboot.wrap).to.equal(true);
            expect(attriboot.shortRotation).to.equal(true);
        });

        describe('.target', () => {
            _simpleSetterTests('target', 1, 'not-number', NaN);

            it('should work', () => {

                attriboot.animationTime = 0;
                attriboot.target = 10;
                expect(attriboot.target).to.equal(10);
                expect(attriboot.current).to.equal(10);

                attriboot.locked = true;
                attriboot.target = 20;
                expect(attriboot.target).to.equal(10);

            });
        });

        describe('.locked', () => {

            it('should lock target', () => {

                attriboot.target = 5;
                expect(attriboot.target).to.equal(5);

                attriboot.locked = true;
                attriboot.target = 10;
                expect(attriboot.target).to.equal(5);
            });
        });

        describe('.wrap', () => {
            _simpleSetterTests('wrap', true, 'not-bool');

            it('should work', () => {

                attriboot.wrap = true;

                attriboot.target = 540;
                expect(attriboot.target).to.equal(180);

                attriboot.target = -120;
                expect(attriboot.target).to.equal(240);

            });
        });

        describe('.shortRotation', () => {
            _simpleSetterTests('shortRotation', true, 'not-bool');

            it('should work', () => {

                attriboot.wrap = true;
                attriboot.shortRotation = true;

                attriboot.target = 350;
                attriboot.update(250);
                expect(attriboot.current).to.be.above(350);

                attriboot.updateImmediate();
                attriboot.target = 10;
                attriboot.update(250);
                expect(attriboot.current).to.be.below(10);

            });
        });

        describe('#getTargetRadians & #getCurrentRadians', () => {

            it('should work', () => {

                attriboot.target = 180;
                expect(attriboot.getTargetRadians()).to.equal(Math.PI);

                attriboot.updateImmediate();
                expect(attriboot.getCurrentRadians()).to.equal(Math.PI);

            });
        });

        describe('#addOffset', () => {

            it('only accepts correct values', () => {
                expect(() => {
                    attriboot.addOffset('not-number', NaN);
                }).to.throw(Error);
            });

            it('should work', () => {

                attriboot.target = 5;
                expect(attriboot._start).to.equal(0);
                expect(attriboot.current).to.equal(0);
                expect(attriboot.target).to.equal(5);

                attriboot.addOffset(2);
                expect(attriboot._start).to.equal(2);
                expect(attriboot.current).to.equal(2);
                expect(attriboot.target).to.equal(7);
            });

            it('should work with .wrap & .shortRotation', () => {

                attriboot.wrap = true;
                attriboot.shortRotation = true;

                expect(attriboot.current).to.equal(0);
                expect(attriboot.target).to.equal(0);

                attriboot.target = 350;
                attriboot.addOffset(-5);
                expect(attriboot._start).to.equal(355);
                expect(attriboot.current).to.equal(355);
                expect(attriboot.target).to.equal(345);

                attriboot.target = 0;
                attriboot.updateImmediate();

                attriboot.target = 350;
                attriboot.addOffset(-730);
                expect(attriboot._start).to.equal(350);
                expect(attriboot.current).to.equal(350);
                expect(attriboot.target).to.equal(340);
            });
        });

    });

});