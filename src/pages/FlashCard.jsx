import { useRef, useState } from "react";
import "../styles/FlashCard.css"
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

export default function FlashCard() {
    // for API's purpose
    const navigate = useNavigate();
    const WORDSET_PAGE_SIZE = 3;
    const RCM_WORDSET_PAGE_SIZE = 4;
    const RCM_WORD_PAGE_SIZE = 10;
    const [wordSetPage, setWordSetPage] = useState(0); // page number of wordset
    const [wordSets, setWordSets] = useState([]); // list of response wordsets
    const [wsLastPage, setWsLastPage] = useState(0); // last page number (0-base index)
    const [learningWordSet, setLearningWordSet] = useState({});  // opening wordset (click "Learn" button)
    const [rcmWordSetPage, setRcmWordSetPage] = useState(0); // page number of recommended wordset
    const [rcmWordSets, setRcmWordSets] = useState([]); // list of recommend wordset by admins
    const [rcmWsLastPage, setRcmWsLastPage] = useState(0); // last page number of recommended wordsets (0-base index)
    const [updatePageSignal, setUpdatePageSignal] = useState(false); // signal to update current page
    const [viewingWordSet, setViewingWordSet] = useState({}); // viewing recommended wordset
    const [rcmWordPage, setRcmWordPage] = useState(0); // wordpage page number
    const [rcmWords, setRcmWords] = useState([]); // recommended words in a recommeded wordset
    const [updateWsEditSignal, setUpdateWsEditSignal] = useState(false); // signal to update WordSetEdit after adding new word
    // for UI's purpose
    const [isWordSetOpen, setWordSetOpen] = useState(false); //check if word set is opened
    const [isAddNewWord, setAddNewWord] = useState(false); //check if user is adding new word to word set
    const [isCreateSet, setCreateSet] = useState(false); // check if user is creating word set
    const [isPreviewRcmWS, setPreviewRcmWS] = useState(false); //check if user is preview recomment word set

    // check if the access token is expired, if so, force the user to login again
    useEffect(() => {
        const access_token = Cookies.get('access_token');
        if (!access_token) {
            navigate('/login');
        }
    }, []);

    // useEffect uses to get a page of wordset
    useEffect(() => {
        async function getWordSetPage() {

            // call api
            const response = await fetch(`${import.meta.env.VITE_TASK_API_BASE_URL}/wordsets/me/pagination?page=${wordSetPage}&pageSize=${WORDSET_PAGE_SIZE}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${Cookies.get('access_token')}`
                }
            });

            const responseJson = await response.json();

            setWordSets(responseJson.response);
            setWsLastPage(Math.ceil(responseJson.pagination.total / WORDSET_PAGE_SIZE) - 1);
        }

        getWordSetPage()
    }, [wordSetPage, updatePageSignal])

    // useEffect uses to get recommended wordsets
    useEffect(() => {
        async function getRcmWordSetPage() {

            // call api
            const response = await fetch(`${import.meta.env.VITE_TASK_API_BASE_URL}/wordsets/recommended/pagination?page=${rcmWordSetPage}&pageSize=${RCM_WORDSET_PAGE_SIZE}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${Cookies.get('access_token')}`
                }
            });

            const responseJson = await response.json();

            setRcmWordSets(responseJson.response);
            setRcmWsLastPage(Math.ceil(responseJson.pagination.total / RCM_WORDSET_PAGE_SIZE) - 1);
        }

        getRcmWordSetPage()
    }, [rcmWordSetPage])

    // useEffect uses to get word page
    useEffect(() => {
        async function getRecommendedWordPage() {
            // reset the words list for not caching
            setRcmWords([]);

            // call api
            const response = await fetch(`${import.meta.env.VITE_TASK_API_BASE_URL}/words/${viewingWordSet.id}/pagination?page=${rcmWordPage}&pageSize=${RCM_WORD_PAGE_SIZE}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${Cookies.get('access_token')}`
                }
            });

            const responseJson = await response.json();

            setRcmWords(responseJson.response);
            setRcmWsLastPage(Math.ceil(responseJson.pagination.total / RCM_WORD_PAGE_SIZE) - 1);
        }

        // set words if the edit page is opened
        if (isPreviewRcmWS) {
            getRecommendedWordPage();
            return;
        }

        // set words to empty if the edit page is closed
        setRcmWords([]);
    }, [isPreviewRcmWS, rcmWordPage])

    return (
        <>
            <div className="flashcard" style={isWordSetOpen || isCreateSet ? { opacity: 0.1 } : {}}  >
                <div className="upper">

                    <div className="wordSets">
                        <div style={{ display: "flex" }}>
                            <h1 className="title">Word Sets</h1>
                            <div className="moveList"> {/*add type for button: move list of wordsets if there are more wordsets than the numbers of wordsets tha the area can show (currently: 4) */}
                            <input type="image" src="../disabled_leftArrow.svg" onClick={ () => wordSetPage > 0 && setWordSetPage(wordSetPage - 1) }></input>
                            <p style={{ display: "inline" }}>{ wordSetPage + 1 }</p>
                            <input type="image" src="../enabled_rightArrow.svg" onClick={ () => wordSetPage < wsLastPage && setWordSetPage(wordSetPage + 1) }></input>
                            </div>
                        </div>

                        <div style={{ display: "flex" }}>
                            <div className="createSet">
                                <input type="image" id="create" src="./add_wordset.svg" onClick={() => setCreateSet(true)}></input>
                            </div>
                            { wordSets.length ? wordSets.map((v, i) => <WordSetCard key={i} wordSetInfo={v} setWordSetOpen={setWordSetOpen} setLearningWordSet={setLearningWordSet} />) : <p className="no-ws-text">There's no wordsets</p> }
                        </div>
                    </div>



                    <div className="userInfo">
                        <img className="userPicture" src="./logo.svg"></img> {/*user avatar*/}
                        <p className="username">Heartistry</p> {/*username*/}
                        <div className="duration">
                            <div style={{ display: "block", margin: 20 }}>
                                <p>Words</p>
                                <p>100</p>
                            </div>
                            <div className="dashboard_separator"></div>
                            <div style={{ display: "block", margin: 20 }}>
                                <p>Days</p>
                                <p>90</p>
                            </div>
                        </div>
                    </div>
                </div>

                <h1 className="rcmTitle">Our recommend word sets</h1>
                <div className="rcmWordSets">
                    <div style={{ display: "flex" }}>
                        { rcmWordSets.map((v, i) => <RcmWordSetCard key={i} setPreviewRcmWS={setPreviewRcmWS} curWordSet={v} setViewingWordSet={setViewingWordSet} setUpdatePageSignal={setUpdatePageSignal} />) }
                    </div>
                </div>
            </div>
            <WordSetPopUp updateWsEditSignal={updateWsEditSignal} learningWordSet={learningWordSet} isWordSetOpen={isWordSetOpen} setWordSetOpen={setWordSetOpen} setAddNewWord={setAddNewWord} />
            <CreateWordSet setUpdatePageSignal={setUpdatePageSignal} isCreateSet={isCreateSet} setCreateSet={setCreateSet} />
            <AddNewWord setUpdateWsEditSignal={setUpdateWsEditSignal} learningWordSet={learningWordSet} isAddNewWord={isAddNewWord} setAddNewWord={setAddNewWord} />
            <PreviewRcmWordSet setUpdatePageSignal={setUpdatePageSignal} viewingWordSet={viewingWordSet} rcmWords={rcmWords} rcmWsLastPage={rcmWsLastPage} rcmWordPage={rcmWordPage} setRcmWordPage={setRcmWordPage} isPreviewRcmWS={isPreviewRcmWS} setPreviewRcmWS={setPreviewRcmWS} setAddNewWord={setAddNewWord} />
        </>
    );
}

function WordSetPopUp({ updateWsEditSignal, learningWordSet, isWordSetOpen, setWordSetOpen, setAddNewWord }) {
    // for API's purpose
    const WORD_PAGE_SIZE = 10;
    const [wordPage, setWordPage] = useState(0); // word page number
    const [words, setWords] = useState([]); // list of words
    const [wLastPage, setWLastPage] = useState(0); // last word page number (0-base index)
    // for UI's purpose
    const [isEditWordSet, setWordSetEdit] = useState(false); // check if user is editing word set
    const [isVisible, setVisible] = useState(true); //show info and button before learn words in word set
    const [isTurn, setTurn] = useState(false); // to change the info on the card when user click (flip the card)

    // useEffect uses to get word page
    useEffect(() => {
        async function getWordPage() {
            // reset the words list for not caching
            setWords([]);

            // call api
            const response = await fetch(`${import.meta.env.VITE_TASK_API_BASE_URL}/words/${learningWordSet.id}/pagination?page=${wordPage}&pageSize=${WORD_PAGE_SIZE}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${Cookies.get('access_token')}`
                }
            });

            const responseJson = await response.json();

            setWords(responseJson.response);
            setWLastPage(Math.ceil(responseJson.pagination.total / WORD_PAGE_SIZE) - 1);
        }

        // set words if the edit page is opened
        if (isEditWordSet) {
            getWordPage();
            return;
        }

        // set words to empty if the edit page is closed
        setWords([]);
    }, [isEditWordSet, wordPage, updateWsEditSignal])

    return (<>
        {
            isWordSetOpen &&
            <div className="pop_up">
                <input type="image" className="unfocused_cancel" src="./unfocused_cancel.svg" onClick={() => { setWordSetOpen(false); setVisible(true); setTurn(false); setAddNewWord(false); setWordSetEdit(false); setWordPage(0) }}></input>
                {isVisible ? <>
                    <h1 className="wordSet_topic">{ learningWordSet.topic }</h1>
                    <p className="vcb_count">Vocabulary count: { learningWordSet.noWords }</p>
                    <button className="start" onClick={() => setVisible(false)}>Start</button>
                    <button className="editWordSet" onClick={() => setWordSetEdit(true)}>Edit word set</button>
                </> : <FlipCard learningWordSet={learningWordSet} setTurn={setTurn} isTurn={isTurn} />}
                {
                    isEditWordSet && <WordSetEdit learningWordSet={learningWordSet} words={words} wLastPage={wLastPage} wordPage={wordPage} setWordPage={setWordPage} setWordSetEdit={setWordSetEdit} setAddNewWord={setAddNewWord} />
                }
            </div>
        }
    </>)
}

function FlipCard({ learningWordSet, setTurn, isTurn }) {
    const [foundWord, setFoundWord] = useState({ isFound: false });
    const [curWordIdx, setCurWordIdx] = useState(0);
    const [allWords, setAllWords] = useState([]);

    // useEffect to get all wordset's words
    useEffect(() => {
        async function getAllWords() {
            // call api
            const response = await fetch(`${import.meta.env.VITE_TASK_API_BASE_URL}/words/${learningWordSet.id}/all`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${Cookies.get('access_token')}`
                }
            });

            const responseJson = await response.json();
            setAllWords(responseJson);
        }

        getAllWords();
    }, []);

    // useEffect to get word's info
    useEffect(() => {
        async function findWord(wordToFind) {
            // call api
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${wordToFind}`, {
                method: 'GET'
            });

            // check if word is valid
            if (response.ok) {
                const responseJson = await response.json();
                const firstWord = responseJson[0];
                const firstMeaning = firstWord.meanings[0];
                const firstDefinition = firstMeaning.definitions[0];

                setFoundWord({
                    word: firstWord.word,
                    phonetic: firstWord.phonetic,
                    partOfSpeech: firstMeaning.partOfSpeech,
                    definition: firstDefinition.definition,
                    example: firstDefinition.example,
                    isFound: true,
                });

                return;
            }

            // handle if word is invalid
            setFoundWord({
                isFound: false,
            });
        }

        if (allWords.length) {
            findWord(allWords[curWordIdx].word);
        }
    }, [curWordIdx]);

    return (
        <div className="card" onClick={() => { 
            isTurn && curWordIdx < allWords.length - 1 && setCurWordIdx(curWordIdx + 1);
            if (curWordIdx < allWords.length - 1) {
                setTurn(!isTurn);
            } else {
                !isTurn && setTurn(!isTurn);
            }
        }}>
            {
                allWords.length ?
                    isTurn ?
                    <div className="back">
                        <div style={{ display: "flex", justifyContent: "center", fontSize: 40, marginBottom: 20 }}>
                            <p className="word">{ allWords[curWordIdx].word }</p>
                            { foundWord.isFound && <p className="wordType">({ foundWord.partOfSpeech })</p> }
                        </div>
                        <div style={{ display: "flex" }}>
                            { foundWord.isFound && foundWord.phonetic && <p className="phonetic"><b>Phonetic:</b> { foundWord.phonetic }</p> }
                        </div>
                        {/* <p className="meaning"><b>Meaning:</b>{ } Thẻ thông tin</p> */}
                        { foundWord.isFound && <p className="definition"><b>Definition:</b> { foundWord.definition }</p> }
                        { foundWord.isFound && foundWord.example && <p className="example"><b>Example:</b> { foundWord.example }</p> }
                        { allWords[curWordIdx].note && <p className="note"><b>Note:</b> { allWords[curWordIdx].note }</p> }
                    </div> :
                    <div className="front">
                        <p style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: 60, wordWrap: "break-word" }}>{ allWords[curWordIdx].word }</p>
                    </div>
                : <p>This wordset has no word</p>
            }
        </div>
    );
}

function WordSetEdit({ learningWordSet, words, wLastPage, wordPage, setWordPage, setWordSetEdit, setAddNewWord }) {
    const [needUpdate, setNeedUpdate] = useState(false); // signal to update words and wordset's topic
    const [changedWords, setChangedWords] = useState([]); // list of changed words
    const changedTopic = useRef(learningWordSet.topic); // change if current wordset's topic changed
    
    // useEffect uses to update changed words
    useEffect(() => {
        async function updateWords(id, word, note) {
            const requestBody = {
                "word": word,
                "note": note,
            }

            // call api
            const response = await fetch(`${import.meta.env.VITE_TASK_API_BASE_URL}/words/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${Cookies.get('access_token')}`
                },
                body: JSON.stringify(requestBody),
            });
        }

        async function updateWordSet(topic) {
            const requestBody = {
                "topic": topic,
            }

            // call api
            const response = await fetch(`${import.meta.env.VITE_TASK_API_BASE_URL}/wordsets/${learningWordSet.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${Cookies.get('access_token')}`
                },
                body: JSON.stringify(requestBody),
            });
        }

        if (needUpdate) {
            for (let word of changedWords) {
                updateWords(word.id, word.word, word.note);
            }
            if (changedTopic.current !== learningWordSet.topic) {
                updateWordSet(changedTopic.current);
            }
            window.alert('Words changed successfully');
        }
        
        setNeedUpdate(false);
    }, [needUpdate])
    
    return (
        <div className="editWS">
            <input
                type="text"
                className="editTopic"
                defaultValue={learningWordSet.topic}
                onChange={(e) => { changedTopic.current = e.target.value }}
            ></input>
            <div style={{ display: "flex", justifyContent: "center", margin: 20 }}>
                <input type="image" src="./disabled_leftArrow.svg"  onClick={ () => wordPage > 0 && setWordPage(wordPage - 1) }></input>
                <p style={{ display: "inline" }}>{ wordPage + 1 }</p>
                <input type="image" src="./enabled_rightArrow.svg"  onClick={ () => wordPage < wLastPage && setWordPage(wordPage + 1) }></input>
                <input type="image" className="unfocused_cancel" src="./unfocused_cancel.svg" onClick={() => { setWordSetEdit(false); setAddNewWord(false) }}></input>
            </div>

            <div className="wordList">
                { words.length ? words.map((v, i) => <WordRow key={i} wordInfo={v} setChangedWords={setChangedWords} />) : <p className="no-w-text">There's no word</p> }
            </div>
            <div style={{ display: "flex" }}>
                <button className="editBtn" style={{ backgroundColor: "#81C784" }} onClick={() => { setAddNewWord(true) }}>Add new word</button>
                <button className="editBtn" style={{ backgroundColor: "#FFEB3B" }} onClick={ () => setNeedUpdate(true) }>Apply change</button>
            </div>
        </div>
    );
}

function CreateWordSet({ setUpdatePageSignal, isCreateSet, setCreateSet }) {
    const [wordSetTopic, setWordSetTopic] = useState(''); // listen to the wordset's topic input
    const [wsCreateSignal, setWsCreateSignal] = useState(false); // signal to create wordset

    // useEffect uses to create new wordset
    useEffect(() => {
        async function createWordSet(topic) {
            const requestBody = {
                "topic": topic,
            }

            // call api
            const response = await fetch(`${import.meta.env.VITE_TASK_API_BASE_URL}/wordsets/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${Cookies.get('access_token')}`
                },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                setUpdatePageSignal(old => !old);
                setCreateSet(false);
            }
        }

        if (wordSetTopic) {
            createWordSet(wordSetTopic);
        }
    }, [wsCreateSignal]);

    return (
        <>
            {isCreateSet &&
                <div className="createNewSet">
                    <div>
                        <h1 style={{ display: "flex", margin: 15, fontSize: 25, marginBottom: 30 }}>Create new word set</h1>
                        <input type="image" className="unfocused_cancel" src="./unfocused_cancel.svg" onClick={() => { { setCreateSet(false) } }}></input>
                    </div>
                    <input type="text" id="createSet" required onChange={ (e) => setWordSetTopic(e.target.value) }></input>
                    <input type="button" id="setName" value={"Create"} onClick={ () => setWsCreateSignal(!wsCreateSignal) }></input>
                </div>
            }
        </>
    )
}

function AddNewWord({ setUpdateWsEditSignal, learningWordSet, isAddNewWord, setAddNewWord }) {
    const [wordToSearch, setWordToSearch] = useState('');
    const [foundWord, setFoundWord] = useState({ isFound: false }); // the word that'll be found using free dictionary api
    const [addSignal, setAddSignal] = useState(false); // signal to add ne word
    const [note, setNote] = useState(''); // note input of the word

    // useEffects use to display info of the searched word
    useEffect(() => {
        async function findWord() {
            // call api
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${wordToSearch}`, {
                method: 'GET'
            });

            // check if word is valid
            if (response.ok) {
                const responseJson = await response.json();
                const firstWord = responseJson[0];
                const firstMeaning = firstWord.meanings[0];
                const firstDefinition = firstMeaning.definitions[0];

                setFoundWord({
                    word: firstWord.word,
                    phonetic: firstWord.phonetic,
                    partOfSpeech: firstMeaning.partOfSpeech,
                    definition: firstDefinition.definition,
                    example: firstDefinition.example,
                    isFound: true,
                });

                return;
            }

            // handle if word is invalid
            setFoundWord({
                isFound: false,
            });
        }

        if (wordToSearch) {
            findWord();
        }
    }, [wordToSearch])

    // useEffect uses to add new word to database
    useEffect(() => {
        async function addWord() {
            const requestBody = {
                "idWordSet": learningWordSet.id,
                "word": wordToSearch,
                "note": note,
            }

            // call api
            const response = await fetch(`${import.meta.env.VITE_TASK_API_BASE_URL}/words/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${Cookies.get('access_token')}`
                },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                setAddSignal(false);
                setFoundWord({ isFound: false });
                setAddNewWord(false);
                setUpdateWsEditSignal(old => !old);
            }
        }

        if (foundWord.isFound) {
            addWord();
        }
    }, [addSignal])

    return (
        <>
            {
                isAddNewWord &&
                <div className="addNewWord">
                    <div style={{ display: "flex" }}>
                        <input type="text" className="findWord" placeholder="Type the word you want to add" onChange={ (e) => setWordToSearch(e.target.value) }></input>
                        <input type="image" className="unfocused_cancel" src="./unfocused_cancel.svg" onClick={() => setAddNewWord(false)}></input>
                    </div>
                    <div style={{ display: "flex", justifyContent: "center", fontSize: 40, marginTop: 20 }}>
                        { foundWord.isFound && <p className="word"> { foundWord.word }</p> }
                        { foundWord.isFound && <p className="wordType"> ({ foundWord.partOfSpeech })</p> }
                    </div>
                    <div style={{ display: "flex" }}>
                        { foundWord.isFound && foundWord.phonetic && <p className="info phonetic"><b>Phonetic:</b> { foundWord.phonetic }</p> }
                    </div>
                    {/* <p className="info meaning"><b>Meaning:</b>{ foundWord.translatedText }</p> */}
                    { foundWord.isFound && <p className="info definition"><b>Definition:</b> { foundWord.definition }</p> }
                    { foundWord.isFound && foundWord.example && <p className="info example"><b>Example:</b> { foundWord.example }</p> }
                    <div style={{ display: "flex" }}>
                        <p className="info note"><b>Note:</b></p>
                        <input placeholder="Add your note" type="text" className="addNote" onChange={ (e) => setNote(e.target.value) }></input>
                    </div>
                    <input type="button" value={"Add"} className={ foundWord.isFound ? "addWord" : "addWord-disable" } onClick={ () => setAddSignal(!addSignal) }></input>
                </div>
            }
        </>
    )
}

function WordSetCard({ wordSetInfo, setWordSetOpen, setLearningWordSet }) {
    return (
        <div className="set">
            <p className="topic">{wordSetInfo.topic}</p>
            <p className="wordNumbers">Number of words: {wordSetInfo.noWords}</p>  {/*show number of words in this wordset*/}
            <button type="" id="learn" onClick={() => { setWordSetOpen(true); setLearningWordSet(wordSetInfo) }}>Learn</button>  {/*add type for button: begin to learn words in wordset*/}
        </div>
    );
}

function WordRow({ wordInfo, setChangedWords }) {
    const newWord = useRef(wordInfo); // temporary object to store changed word
    const isChanged = useRef(false); // true if onChange event happened, false if onBlur
    const [isDeleted, setDeleted] = useState(false); // true if word needs to be deleted, false if not

    useEffect(() => {
        async function deleteWord() {
            // call api
            const response = await fetch(`${import.meta.env.VITE_TASK_API_BASE_URL}/words/${wordInfo.id}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${Cookies.get('access_token')}`
                },
            });
        }

        if (isDeleted) {
            deleteWord();
        }
    }, [isDeleted])

    return (<>
        {!isDeleted && <div style={{ display: "flex" }}> {/*add this div to add word in this list */}
            <input
                type="text"
                className="editInfo"
                defaultValue={wordInfo.word}
                required
                onBlur={ (e) => setChangedWords(
                    (old) => {
                        if (isChanged.current) {
                            const exists = old.some(item => item.id === wordInfo.id);
                            newWord.current = {
                                ...newWord.current,
                                word: e.target.value,
                            }
                            isChanged.current = false;
                            if (exists) {
                                return old.map(item => item.id === newWord.current.id ? newWord.current : item);
                            } else {
                                return [...old, newWord.current];
                            }
                        }
                        return old;
                    } 
                )}
                onChange={ () => isChanged.current = true }
            ></input>
            <input
                type="text"
                className="editInfo"
                defaultValue={wordInfo.note}
                required
                onBlur={ (e) => setChangedWords(
                    (old) => {
                        if (isChanged.current) {
                            const exists = old.some(item => item.id === wordInfo.id);
                            newWord.current = {
                                ...newWord.current,
                                note: e.target.value,
                            }
                            isChanged.current = false;
                            if (exists) {
                                return old.map(item => item.id === newWord.current.id ? newWord.current : item);
                            } else {
                                return [...old, newWord.current];
                            }
                        }
                        return old;
                    } 
                )}
                onChange={ () => isChanged.current = true }
            ></input>
            <input type="image" className="deleteWord" src="./unfocused_cancel.svg" style={{ padding: "1px" }} onClick={ () => { setDeleted(true); } }></input>
        </div>}
    </>)
}

function PreviewRcmWordSet({ setUpdatePageSignal, viewingWordSet, rcmWords, rcmWsLastPage, rcmWordPage, setRcmWordPage, isPreviewRcmWS, setPreviewRcmWS, setAddNewWord }) {
    const [needSave, setNeedSave] = useState(false); // true if user wanna save recommended wordsets

    // useEffect uses to save new wordset
    useEffect(() => {
        async function addOneWord(savedWordSetId, word) {
            const requestBody = {
                "idWordSet": savedWordSetId,
                "word": word.word,
                "note": word.note
            }

            const response1 = await fetch(`${import.meta.env.VITE_TASK_API_BASE_URL}/words/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${Cookies.get('access_token')}`
                },
                body: JSON.stringify(requestBody),
            });
        }

        async function findAllWords(savedWordSetId) {
            // call api
            const response = await fetch(`${import.meta.env.VITE_TASK_API_BASE_URL}/words/${viewingWordSet.id}/all`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${Cookies.get('access_token')}`
                }
            });

            if (response.ok) {
                const allWords = await response.json();
                for (let word of allWords) {
                    await addOneWord(savedWordSetId, word);
                }
            }
        }

        async function saveRecommendedWordSet(topic) {
            const requestBody = {
                "topic": topic,
            }

            // call api
            const response = await fetch(`${import.meta.env.VITE_TASK_API_BASE_URL}/wordsets/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${Cookies.get('access_token')}`
                },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                const savedWordSet = await response.json()
                findAllWords(savedWordSet.id);
                setUpdatePageSignal(old => !old);
                setPreviewRcmWS(false);
            }
        }

        if (needSave) {
            saveRecommendedWordSet(viewingWordSet.topic);
        }
    }, [needSave]);

    return (
        <>
            {
                isPreviewRcmWS &&
                <div className="preview">
                    <div style={{ display: "flex" }}>
                        <input type="text" className="editTopic" value={viewingWordSet.topic} style={{ pointerEvents: "none" }}></input>
                        <input type="image" className="unfocused_cancel" src="./unfocused_cancel.svg" onClick={() => setAddNewWord(false)}></input>
                    </div>
                    <div style={{ display: "flex", justifyContent: "center", margin: 20 }}>
                        <input type="image" src="./disabled_leftArrow.svg" onClick={ () => rcmWordPage > 0 && setRcmWordPage(rcmWordPage - 1) }></input>
                        <p style={{ display: "inline" }}>{ rcmWordPage + 1 }</p>
                        <input type="image" src="./enabled_rightArrow.svg" onClick={ () => rcmWordPage < rcmWsLastPage && setRcmWordPage(rcmWordPage + 1) }></input>
                        <input type="image" className="unfocused_cancel" src="./unfocused_cancel.svg" onClick={() => { setPreviewRcmWS(false) }}></input>
                    </div>
                    <div className="wordList">
                        { rcmWords.length ? rcmWords.map((v, i) => <RcmWordRow key={i} wordInfo={v} />) : <p className="no-w-text">There's no word</p> }
                    </div>
                    <div style={{ display: "flex" }}>
                        <button className="editBtn" style={{ backgroundColor: "#81C784" }} onClick={ () => setNeedSave(true) }>Add to your word sets</button>
                    </div>
                </div>
            }
        </>
    )
}

function RcmWordSetCard({ setPreviewRcmWS, curWordSet, setViewingWordSet, setUpdatePageSignal }) {
    const [needSave, setNeedSave] = useState(false); // true if user wanna save recommended wordsets

    // useEffect uses to save new wordset
    useEffect(() => {
        async function addOneWord(savedWordSetId, word) {
            const requestBody = {
                "idWordSet": savedWordSetId,
                "word": word.word,
                "note": word.note
            }

            const response1 = await fetch(`${import.meta.env.VITE_TASK_API_BASE_URL}/words/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${Cookies.get('access_token')}`
                },
                body: JSON.stringify(requestBody),
            });
        }

        async function findAllWords(savedWordSetId) {
            // call api
            const response = await fetch(`${import.meta.env.VITE_TASK_API_BASE_URL}/words/${curWordSet.id}/all`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${Cookies.get('access_token')}`
                }
            });

            if (response.ok) {
                const allWords = await response.json();
                for (let word of allWords) {
                    await addOneWord(savedWordSetId, word);
                }
            }
        }

        async function saveRecommendedWordSet(topic) {
            const requestBody = {
                "topic": topic,
            }

            // call api
            const response = await fetch(`${import.meta.env.VITE_TASK_API_BASE_URL}/wordsets/add`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${Cookies.get('access_token')}`
                },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                const savedWordSet = await response.json()
                findAllWords(savedWordSet.id);
                setUpdatePageSignal(old => !old);
            }
        }

        if (needSave) {
            saveRecommendedWordSet(curWordSet.topic);
        }
    }, [needSave]);

    return (
        <div className="rcmSet">
            <p className="topic">{curWordSet.topic}</p>
            <p className="wordNumbers">Number of words: { curWordSet.noWords }</p>  {/*show number of words in this wordset*/}
            <div style={{ display: "flex", justifyContent: "right", marginTop: 35, marginRight: 10 }}>
                <input type="image" id="add" className="rcmButton" src="./preview.svg" style={{ padding: 10 }} onClick={() => { setPreviewRcmWS(true); setViewingWordSet(curWordSet) }}></input>
                <input type="image" id="preview" className="rcmButton" src="./add_wordset.svg" style={{ padding: 5 }} onClick={ () => setNeedSave(true) }></input>
            </div>
        </div>
    )
}

function RcmWordRow({ wordInfo }) {
    return (
        <div style={{ display: "flex", pointerEvents: "none" }}> {/*add this div to add word in this list */}
            <input type="text" className="editInfo" value={wordInfo.word}></input>
            <input type="text" className="editInfo" value={wordInfo.note}></input>
        </div>
    );
}