import React, { useState } from 'react';
import { Input, Col, Button, Container, InputGroup, InputGroupAddon, Collapse, Card, CardBody, CardHeader, CardTitle, Row } from 'reactstrap';

const mock = [
    {
        "word": "флорист",
        "solutions": [
            {
                "firstWord": {
                    "letters": "(л,о,ф)",
                    "words": [
                        "фол"
                    ]
                },
                "secondWord": {
                    "letters": "(и,р,с,т)",
                    "words": [
                        "тирс"
                    ]
                }
            },
            {
                "firstWord": {
                    "letters": "(и,р,с)",
                    "words": [
                        "рис",
                        "сир"
                    ]
                },
                "secondWord": {
                    "letters": "(л,о,т,ф)",
                    "words": [
                        "флот"
                    ]
                }
            }
        ]
    },
    {
        "word": "суррогат",
        "solutions": [
            {
                "firstWord": {
                    "letters": "(а,г,о,р)",
                    "words": [
                        "арго",
                        "гора"
                    ]
                },
                "secondWord": {
                    "letters": "(р,с,т,у)",
                    "words": [
                        "руст",
                        "трус"
                    ]
                }
            }
        ]
    }
];

const Variance = (props) => {
    const { word, solutions } = props;

    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => setIsOpen(!isOpen);

    const listOfCombinations = solutions.map((item, key) => {

        const listOfWords = (words) => words.map((item, key) => <li key={key}>{item}</li>);

        return (
            <div>
                <Collapse isOpen={isOpen}>
                    <Card key={key}>
                        <CardHeader>{key + 1} вариант</CardHeader>
                        <CardBody>
                            <CardTitle>Первое слово из букв {item.firstWord.letters}</CardTitle>
                            {listOfWords(item.firstWord.words)}
                        </CardBody>
                        <CardBody>
                            <CardTitle>Второе слово из букв {item.secondWord.letters}</CardTitle>
                            {listOfWords(item.secondWord.words)}
                        </CardBody>
                    </Card>
                </Collapse>
            </div>
        )
    })

    return (
        <Row>
            <Button color="primary" onClick={toggle} style={{ marginBottom: '1rem' }}>{word}</Button>
            {listOfCombinations}
        </Row>
    );
}

const Main = () => {

    const List = mock.map((item, key) => <Variance key={key} word={item.word} solutions={item.solutions} />);

    return (
        <Container>
            <Col>
                <InputGroup>
                    <Input placeholder="Слова для поиска" />
                    <InputGroupAddon>
                        <Button color="primary">Искать</Button>
                    </InputGroupAddon>
                </InputGroup>
            </Col>
            <Col>
                {List}
            </Col>
        </Container>
    )
}

export default Main;