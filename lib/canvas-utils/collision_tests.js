        //test above
        var testIntersect1 = polygonsIntersect({
            x: 0,
            y: 0,
            points: [
                [0, 0],
                [10, 0],
                [10, 10],
                [0, 10]
            ]
        }, {
            x: 5,
            y: 5,
            points: [
                [0, 0],
                [10, 0],
                [10, 10],
                [0, 10]
            ]
        });
        console.log("should be true", testIntersect1);
        var testIntersect2 = polygonsIntersect({
            x: 0,
            y: 0,
            points: [
                [0, 0],
                [10, 0],
                [10, 10],
                [0, 10]
            ]
        }, {
            x: 15,
            y: 15,
            points: [
                [0, 0],
                [10, 0],
                [10, 10],
                [0, 10]
            ]
        });
        console.log("should be false:", testIntersect2);
        var testIntersect3 = polygonsIntersect({
            x: 15,
            y: 15,
            points: [
                [0, 0],
                [10, 0],
                [10, 10],
                [0, 10]
            ]
        }, {
            x: 0,
            y: 0,
            points: [
                [0, 0],
                [10, 0],
                [10, 10],
                [0, 10]
            ]
        });
        console.log("should be false:", testIntersect3);
        var testIntersect4 = polygonsIntersect({
            x: 5,
            y: 5,
            points: [
                [0, 0],
                [10, 0],
                [10, 10],
                [0, 10]
            ]
        }, {
            x: 0,
            y: 0,
            points: [
                [0, 0],
                [10, 0],
                [10, 10],
                [0, 10]
            ]
        });
        console.log("should be true", testIntersect4);
        var testIntersect5 = polygonsIntersect({
            x: 0,
            y: 0,
            points: [
                [0, 0],
                [10, 0],
                [10, 10],
                [0, 10]
            ]
        }, {
            x: 5,
            y: 0,
            points: [
                [0, 5],
                [10, 0],
                [10, 10]
            ]
        });
        console.log("should be true", testIntersect5);
        var testIntersect6 = polygonsIntersect({
            x: 5,
            y: 0,
            points: [
                [0, 5],
                [10, 0],
                [10, 10]
            ]
        }, {
            x: 0,
            y: 0,
            points: [
                [0, 0],
                [10, 0],
                [10, 10],
                [0, 10]
            ]
        });
        console.log("should be true", testIntersect6);
