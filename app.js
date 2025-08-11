window.onload = function () {
    const {
        createTheme,
        ThemeProvider,
        CssBaseline,
        AppBar,
        Toolbar,
        Typography,
        Box,
        Container,
        Tabs,
        Tab,
        Card,
        CardContent,
        Button,
        IconButton,
        TextField,
        Dialog,
        DialogTitle,
        DialogContent,
        DialogActions,
        Grid,
        Paper,
        Slider,
        List,
        ListItem,
        ListItemText,
        CircularProgress,
        Chip,
        Switch,
        FormControlLabel,
        Snackbar,
        Alert,
        ListSubheader,
    } = MaterialUI;

    const __fm = window.framerMotion || window["framer-motion"] || window.Motion;
    const motion = __fm?.motion || {
        div: ({ children, ...props }) => React.createElement("div", props, children),
    };
    const AnimatePresence = __fm?.AnimatePresence || (({ children }) => React.createElement(React.Fragment, null, children));

    const __dnd = (window.ReactDnD || window["ReactDnD"]) || {};
    const __dndHtml5 = (window.ReactDnDHTML5Backend || window["ReactDnDHTML5Backend"]) || {};
    const __dndTouch = (window.ReactDnDTouchBackend || window["ReactDnDTouchBackend"]) || {};

    const DndProvider = __dnd.DndProvider || (({ children }) => React.createElement(React.Fragment, null, children));
    const useDrag = __dnd.useDrag || (() => ([{ isDragging: false }, () => {}]));
    const useDrop = __dnd.useDrop || (() => ([{ isOver: false }, () => {}]));
    // UMD exports can vary: { HTML5Backend }, default, or the object itself
    const HTML5Backend = __dndHtml5.HTML5Backend || __dndHtml5.default || __dndHtml5;
    const TouchBackend = __dndTouch.TouchBackend || __dndTouch.default || __dndTouch;
    const isMobile = /Mobi|Android|iPhone|iPad|iPod|Touch/i.test(navigator.userAgent);
    const DnDBackend = isMobile && typeof TouchBackend === 'function' ? TouchBackend : HTML5Backend;

    // Do NOT store API keys client-side. All AI requests go through
    // the serverless proxy at `/.netlify/functions/ai-proxy` which
    // reads provider keys from environment variables.

    async function callGeminiAPI(prompt, maxRetries = 3, initialDelay = 500) {
        // Netlify-only proxy path
        const system = 'You are a helpful tutor inside an interactive study guide. Keep answers concise and under 120 words.';
        const endpoint = '/.netlify/functions/ai-proxy';
        let delay = initialDelay;
        let lastError = '';
        for (let i = 0; i < maxRetries; i++) {
            try {
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt, system })
                });
                if (!response.ok) {
                    const text = await response.text().catch(() => '');
                    lastError = `HTTP ${response.status}: ${text}`;
                    throw new Error(lastError);
                }
                const data = await response.json();
                return data?.content || 'No response from AI.';
            } catch (error) {
                console.error(`Attempt ${i + 1} failed:`, error);
                lastError = String(error?.message || error);
                if (i < maxRetries - 1) { await new Promise((r) => setTimeout(r, delay)); delay *= 2; }
            }
        }
        return `Error communicating with AI after ${maxRetries} attempts. Last error: ${lastError}`;
    }

    const useLocalStorage = (key, initialValue) => {
        const [storedValue, setStoredValue] = React.useState(() => {
            try {
                const item = window.localStorage.getItem(key);
                return item ? JSON.parse(item) : initialValue;
            } catch (error) {
                console.error(error);
                return initialValue;
            }
        });
        const setValue = (value) => {
            try {
                const valueToStore = value instanceof Function ? value(storedValue) : value;
                setStoredValue(valueToStore);
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            } catch (error) {
                console.error(error);
            }
        };
        return [storedValue, setValue];
    };

    const StyledCard = ({ children, ...props }) => (
        React.createElement(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } },
            React.createElement(Card, { elevation: 3, ...props }, children)
        )
    );

    const introductionFlashcards = [
        { id: 1, term: "Infinite Series", definition: "A series of numbers that goes on forever but can still add up to a finite number, like walking halfway to a wall repeatedly." },
        { id: 2, term: "The Monty Hall Problem", definition: "A probability puzzle where switching your choice after new information is revealed increases your chance of winning from 1/3 to 2/3." },
        { id: 3, term: "Statistical Intuition", definition: "Understanding the underlying concepts and real-world applications of statistics, not just the technical formulas." },
        { id: 4, term: "Garbage In, Garbage Out", definition: "The principle that the quality of statistical conclusions depends entirely on the quality of the initial data." },
    ];

    const chapter1CorrelationItems = [
        { id: 1, name: "Smoking and Cancer", type: "causation" },
        { id: 2, name: "Bran Muffins and Lower Cancer Rates", type: "correlation" },
        { id: 3, name: "Education Level and Terrorism", type: "correlation" },
    ];

    function ModuleCard({ title, children }) {
        return (
            React.createElement(StyledCard, { sx: { mb: 3 } },
                React.createElement(CardContent, null,
                    React.createElement(Typography, { variant: "h5", component: "h2", gutterBottom: true }, title),
                    children
                )
            )
        );
    }

    function InfiniteSeriesSim() {
        // Step-based model toward a wall at 2 feet
        const wallPosition = 2; // feet
        const [steps, setSteps] = React.useState([{ distance: 0, total: 0 }]);
        const [isComplete, setIsComplete] = React.useState(false);

        const takeStep = () => {
            setSteps((prev) => {
                const last = prev[prev.length - 1];
                const remaining = wallPosition - last.total;
                if (remaining < 0.001) { setIsComplete(true); return prev; }
                const newDistance = remaining / 2;
                return [...prev, { distance: newDistance, total: last.total + newDistance }];
            });
        };
        const reset = () => { setSteps([{ distance: 0, total: 0 }]); setIsComplete(false); };

        const currentTotal = steps[steps.length - 1].total;
        const lastStep = steps[steps.length - 1].distance || 0;
        // Keep a visible gap so the block never reaches the wall visually
        const wallPct = 4;   // matches the wall Box width: "4%"
        const iconPct = 5;   // matches moving block width: "5%"
        const gapPct  = 1;   // small safety margin so it never touches
        const maxPctTravel = 100 - wallPct - iconPct - gapPct; // available horizontal travel
        const percentToWall = Math.min(maxPctTravel - 0.001, Math.max(0, (currentTotal / wallPosition) * maxPctTravel));

        return (
            React.createElement(Box, null,
                React.createElement(Typography, { variant: "body1", paragraph: true },
                    "[cite_start]\"Visualize Wheelan's halving-to-a-wall infinite series. The wall is at 2 feet. Each step halves the remaining distance, so the total converges toward 2 but never reaches it. [cite: 117-126]\""
                ),

                // --- VISUAL SIMULATION AREA ---
                React.createElement(Box, { sx: { position: "relative", height: "96px", border: "1px solid", borderColor: "divider", borderRadius: "4px", my: 2, p: 1, overflow: "hidden", display: 'flex', alignItems: 'center' } },
                    // Wall at right
                    React.createElement(Box, { sx: { position: "absolute", right: 0, top: 0, bottom: 0, width: "4%", backgroundColor: "grey.800", borderTopRightRadius: '4px', borderBottomRightRadius: '4px' } }),
                    React.createElement(Typography, { variant: "caption", sx: { position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', fontWeight: 700 } }, "Wall"),

                    // Moving block labeled "You"; animate left percentage of container width
                    React.createElement(motion.div, {
                        initial: { left: "0%" },
                        animate: { left: `${percentToWall}%` },
                        transition: { type: 'spring', stiffness: 110, damping: 18 },
                        style: { position: 'absolute', bottom: '12px', left: `${percentToWall}%`, width: '5%', height: '56px', background: '#1976d2', color: 'white', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }
                    }, "You")
                ),

                // --- STATS DISPLAY ---
                React.createElement(Grid, { container: true, spacing: 2, textAlign: 'center' },
                    React.createElement(Grid, { item: true, xs: 12, sm: 4 }, React.createElement(Typography, { variant: 'body2' }, "Steps: ", React.createElement('b', null, steps.length - 1))),
                    React.createElement(Grid, { item: true, xs: 12, sm: 4 }, React.createElement(Typography, { variant: 'body2' }, "Last Step: ", React.createElement('b', null, lastStep.toFixed(4)), " ft")),
                    React.createElement(Grid, { item: true, xs: 12, sm: 4 }, React.createElement(Typography, { variant: 'body2' }, "Total Distance: ", React.createElement('b', { style: { color: '#1976d2' } }, currentTotal.toFixed(4)), " ft"))
                ),

                // --- CONTROLS ---
                React.createElement(Box, { sx: { display: 'flex', justifyContent: 'center', gap: 2, mt: 3 } },
                    React.createElement(Button, { variant: 'contained', onClick: takeStep, disabled: isComplete }, "Take a Step"),
                    React.createElement(Button, { variant: 'outlined', onClick: reset }, "Reset")
                ),

                // Convergence note
                isComplete && React.createElement(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 } },
                    React.createElement(Typography, { sx: { mt: 2, color: 'success.main', fontWeight: 600 } }, "This is convergence: steps shrink infinitely, the total approaches 2."))
            )
        );
    }

    function NarrativeNuggets() {
        return (
            React.createElement(Box, null,
                React.createElement(motion.div, { whileHover: { scale: 1.02 }, transition: { type: "spring", stiffness: 300 } },
                    React.createElement(Paper, { elevation: 2, sx: { p: 2, mb: 2 } },
                        React.createElement(Typography, { variant: "h6" }, "The AP Calculus Exam Mix-Up"),
                        React.createElement(Typography, { variant: "body2" }, "[cite_start]The author recounts the joy of his high school calculus teacher accidentally giving the class the *second* semester final exam instead of the first, validating his feeling that he needed to understand the \"point\" of what he was learning, not just memorize formulas. This experience contrasted with physics, where formulas had clear, cool applications, like calculating the distance of a home run. [cite: 44-71]")
                    )
                ),
                React.createElement(motion.div, { whileHover: { scale: 1.02 }, transition: { type: "spring", stiffness: 300 } },
                    React.createElement(Paper, { elevation: 2, sx: { p: 2 } },
                        React.createElement(Typography, { variant: "h6" }, "The Monty Hall Problem"),
                        React.createElement(Typography, { variant: "body2" }, "Introduced through the game show \"Let's Make a Deal,\" this classic probability puzzle illustrates how intuition can be misleading. A contestant chooses one of three doors. The host, who knows where the prize is, opens another door to reveal a goat. The contestant is then asked if they want to switch their choice. [cite_start]The counter-intuitive answer is YES—switching doubles your chance of winning from 1/3 to 2/3. [cite: 80-93]")
                    )
                )
            )
        );
    }

    function KeyIdeas() {
        return (
            React.createElement(List, null,
                React.createElement(ListItem, null, React.createElement(ListItemText, { primary: "Statistics is About Intuition", secondary: "The book's core promise is to make statistical concepts intuitive and accessible, arguing that understanding the 'why' makes the technical details easier to grasp. [cite: 99, 132]" })),
                React.createElement(ListItem, null, React.createElement(ListItemText, { primary: "Data Quality is Paramount", secondary: "The principle of 'Garbage in, garbage out' is central. [cite_start]Sophisticated statistical techniques are useless if the underlying data is poor, leading to wildly misleading conclusions. [cite: 24, 135]" })),
                React.createElement(ListItem, null, React.createElement(ListItemText, { primary: "The Duality of Statistics", secondary: "As Andrejs Dunkels noted, 'It's easy to lie with statistics, but it's hard to tell the truth without them.' [cite_start]The book aims to equip readers to spot misuse while appreciating the power of data for good. [cite: 154]" }))
            )
        );
    }

    function Flashcard({ card, isFlipped, onFlip }) {
        return (
            React.createElement("div", { className: "flashcard-container", onClick: onFlip },
                React.createElement(motion.div, { className: `flashcard ${isFlipped ? "flipped" : ""}`, initial: false, animate: { rotateY: isFlipped ? 180 : 0 }, transition: { duration: 0.6, ease: "easeInOut" } },
                    React.createElement(Paper, { className: "flashcard-face flashcard-front", elevation: 4 }, React.createElement(Typography, { variant: "h6" }, card.term)),
                    React.createElement(Paper, { className: "flashcard-face flashcard-back", elevation: 4, sx: { backgroundColor: "grey.200" } }, React.createElement(Typography, { variant: "body2" }, card.definition))
                )
            )
        );
    }

    function FlashcardModule({ cards }) {
        const [flippedCards, setFlippedCards] = React.useState({});
        const handleFlip = (id) => setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
        return (
            React.createElement(Grid, { container: true, spacing: 2 },
                cards.map((card) => (
                    React.createElement(Grid, { item: true, xs: 12, sm: 6, key: card.id },
                        React.createElement(Flashcard, { card: card, isFlipped: !!flippedCards[card.id], onFlip: () => handleFlip(card.id) })
                    )
                ))
            )
        );
    }

    function MeanMedianSim() {
        const initialData = [35000, 35000, 35000, 35000, 35000, 35000, 35000, 35000, 35000, 35000];
        const [data, setData] = React.useState(initialData);
        const [outlierAdded, setOutlierAdded] = React.useState(false);
        const [explanation, setExplanation] = React.useState("");
        const [loading, setLoading] = React.useState(false);
        const calculateMean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
        const calculateMedian = (arr) => { const sorted = [...arr].sort((a, b) => a - b); const mid = Math.floor(sorted.length / 2); return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2; };
        const handleToggleOutlier = () => { if (outlierAdded) setData(initialData); else setData([...initialData, 1000000000]); setOutlierAdded(!outlierAdded); };
        const fetchExplanation = async () => { setLoading(true); setExplanation(""); const prompt = `Explain the difference between mean and median like I'm 5, using a simple analogy. Refer to the idea of an 'outlier' or an extreme value. Keep it under 100 words.`; const result = await callGeminiAPI(prompt); setExplanation(result); setLoading(false); };
        const mean = calculateMean(data); const median = calculateMedian(data);
        return (
            React.createElement(Box, null,
                React.createElement(Typography, { variant: "body1", paragraph: true }, "[cite_start]The book uses a great analogy: Ten people are in a bar, each earning $35,000 a year. Their mean (average) and median (middle) income is $35,000. When Bill Gates (income ~$1B) walks in, the mean income skyrockets to over $90 million, but the median income stays at $35,000. The median is a better description of the 'typical' person in the bar. [cite: 447-461]"),
                React.createElement(Grid, { container: true, spacing: 2, alignItems: "center" },
                    React.createElement(Grid, { item: true, xs: 12, md: 6 },
                        React.createElement(Typography, null, "Mean (Average): ", React.createElement("strong", null, `$${mean.toLocaleString(undefined, { maximumFractionDigits: 0 })}`)),
                        React.createElement(Typography, null, "Median (Middle Value): ", React.createElement("strong", null, `$${median.toLocaleString()}`))
                    ),
                    React.createElement(Grid, { item: true, xs: 12, md: 6 }, React.createElement(Button, { variant: "contained", onClick: handleToggleOutlier }, outlierAdded ? "Remove Bill Gates" : "Add Bill Gates"))
                ),
                React.createElement(Box, { sx: { mt: 2, display: "flex", gap: 1 } }, React.createElement(Button, { variant: "outlined", size: "small", onClick: fetchExplanation, disabled: loading }, "Explain Like I'm 5")),
                loading && React.createElement(CircularProgress, { size: 24, sx: { mt: 2 } }),
                explanation && React.createElement(Paper, { elevation: 1, sx: { p: 2, mt: 2, backgroundColor: "grey.100" } }, React.createElement(Typography, { variant: "body2" }, explanation))
            )
        );
    }

    function GiniIndexExplorer() {
        const countries = [ { name: "Sweden", gini: 0.23 }, { name: "Canada", gini: 0.32 }, { name: "China", gini: 0.42 }, { name: "United States", gini: 0.45 }, { name: "Brazil", gini: 0.54 }, { name: "South Africa", gini: 0.65 } ];
        const [selectedGini, setSelectedGini] = React.useState(0.45);
        const [explanation, setExplanation] = React.useState("");
        const [problem, setProblem] = React.useState("");
        const [loading, setLoading] = React.useState({ eli5: false, problem: false });
        const handleSliderChange = (event, newValue) => { setSelectedGini(newValue); };
        const fetchExplanation = async () => { setLoading((p) => ({ ...p, eli5: true })); setExplanation(""); const prompt = `Explain the Gini Index like I'm 5. Use an analogy like sharing cookies or pizza slices. A Gini of 0 is perfect sharing, and a Gini of 1 is one person getting all the cookies. Keep it under 100 words.`; const result = await callGeminiAPI(prompt); setExplanation(result); setLoading((p) => ({ ...p, eli5: false })); };
        const fetchProblem = async () => { setLoading((p) => ({ ...p, problem: true })); setProblem(""); const prompt = `Create a simple practice problem about the Gini Index. For example: "Country A has a Gini index of 0.25 and Country B has a Gini index of 0.50. Which country has a more unequal distribution of wealth and why?" Provide the answer in a separate paragraph starting with 'Answer:'.`; const result = await callGeminiAPI(prompt); setProblem(result); setLoading((p) => ({ ...p, problem: false })); };
        return (
            React.createElement(Box, null,
                React.createElement(Typography, { variant: "body1", paragraph: true }, "[cite_start]The Gini index is a descriptive statistic that collapses complex information about a country's income distribution into a single number from 0 (perfect equality) to 1 (one person has all the wealth). It's a tool for comparison. [cite: 179-183]"),
                React.createElement(Typography, { gutterBottom: true }, "Inequality Scale (0 = Equal, 1 = Unequal)"),
                React.createElement(Slider, { value: selectedGini, onChange: handleSliderChange, "aria-labelledby": "gini-slider", step: 0.01, min: 0, max: 1, valueLabelDisplay: "auto" }),
                React.createElement(Box, { sx: { display: "flex", flexWrap: "wrap", gap: 1, my: 2 } }, countries.map((c) => React.createElement(Chip, { key: c.name, label: `${c.name} (${c.gini})`, onClick: () => setSelectedGini(c.gini), variant: selectedGini === c.gini ? "filled" : "outlined", color: "primary" }))),
                React.createElement(Box, { sx: { mt: 2, display: "flex", gap: 1 } }, React.createElement(Button, { variant: "outlined", size: "small", onClick: fetchExplanation, disabled: loading.eli5 }, "Explain Like I'm 5"), React.createElement(Button, { variant: "outlined", size: "small", onClick: fetchProblem, disabled: loading.problem }, "Generate Practice Problem")),
                loading.eli5 && React.createElement(CircularProgress, { size: 24, sx: { mt: 2 } }),
                explanation && React.createElement(Paper, { elevation: 1, sx: { p: 2, mt: 2, backgroundColor: "grey.100" } }, React.createElement(Typography, { variant: "body2" }, explanation)),
                loading.problem && React.createElement(CircularProgress, { size: 24, sx: { mt: 2 } }),
                problem && React.createElement(Paper, { elevation: 1, sx: { p: 2, mt: 2, backgroundColor: "grey.100" } }, React.createElement(Typography, { variant: "body2", sx: { whiteSpace: "pre-wrap" } }, problem))
            )
        );
    }

    function SpotTheStatistic() {
        const stats = [ { id: 1, statement: "Jay Cutler had a passer rating of 31.8 in the 2011 playoffs. [cite: 170]", type: "Index" }, { id: 2, statement: "The United States has a Gini index of .45, measuring income inequality. [cite: 189]", type: "Index" }, { id: 3, statement: "Mickey Mantle was a career .298 hitter. [cite: 222]", type: "Descriptive Statistic" } ];
        const [currentStatIndex, setCurrentStatIndex] = React.useState(0);
        const [feedback, setFeedback] = React.useState("");
        const handleAnswer = (answer) => { if (answer === stats[currentStatIndex].type) setFeedback("Correct!"); else setFeedback(`Not quite! That's an example of a(n) ${stats[currentStatIndex].type}.`); setTimeout(() => { setFeedback(""); setCurrentStatIndex((prev) => (prev + 1) % stats.length); }, 2000); };
        return (
            React.createElement(Box, null,
                React.createElement(Typography, { variant: "body1", paragraph: true }, "Statistics are used to summarize complex information. Can you identify the type of statistic being used in these examples from the book?"),
                React.createElement(Paper, { elevation: 2, sx: { p: 2, my: 2, minHeight: "80px" } }, React.createElement(Typography, { variant: "h6" }, `"${stats[currentStatIndex].statement}"`)),
                React.createElement(Box, { sx: { display: "flex", justifyContent: "center", gap: 2 } }, React.createElement(Button, { variant: "contained", onClick: () => handleAnswer("Index") }, "Index"), React.createElement(Button, { variant: "contained", onClick: () => handleAnswer("Descriptive Statistic") }, "Descriptive Statistic")),
                feedback && React.createElement(Typography, { align: "center", sx: { mt: 2, color: feedback === "Correct!" ? "green" : "red" } }, feedback)
            )
        );
    }

    const ItemTypes = { CARD: "card" };
    function DraggableItem({ item }) {
        const [{ isDragging }, drag] = useDrag(() => ({ type: ItemTypes.CARD, item: { id: item.id, type: item.type }, collect: (monitor) => ({ isDragging: !!monitor.isDragging() }) }));
        return (
            React.createElement("div", { ref: drag, className: "draggable-item", style: { display: "inline-block", opacity: isDragging ? 0.6 : 1 } },
                React.createElement(Chip, { label: item.name, color: "secondary", sx: { m: 0.5 } })
            )
        );
    }
    function DropTarget({ type, onDrop, children, title }) {
        const [{ isOver }, drop] = useDrop(() => ({ accept: ItemTypes.CARD, drop: (item) => onDrop(item, type), collect: (monitor) => ({ isOver: !!monitor.isOver() }) }));
        return (
            React.createElement("div", { ref: drop, className: `drop-target ${isOver ? "drop-target-hover" : ""}` },
                React.createElement(Typography, { variant: "h6", align: "center", gutterBottom: true }, title),
                React.createElement(Box, { sx: { display: "flex", flexWrap: "wrap", justifyContent: "center", p: 2, flex: 1 } }, children)
            )
        );
    }
function CorrelationCausationMatcher() {
    const ItemTypes = { SCENARIO: "scenario" };

    // Initial scenarios from the book and examples
    const initialScenarios = [
        { id: 1, name: "Smoking and Cancer", correctType: "causation" },
        { id: 2, name: "Bran Muffins and Lower Cancer Rates", correctType: "correlation" },
        { id: 3, name: "Education Level and Terrorism", correctType: "correlation" },
        { id: 4, name: "Ice cream sales and drowning deaths", correctType: "correlation" },
        { id: 5, name: "Exercise and weight loss", correctType: "causation" },
    ];
    // Offline fallback scenarios when AI quota is exhausted
    const offlineScenarios = [
        "Cities with more libraries also report higher crime rates in the same period.",
        "People who sleep with their shoes on report more headaches the next morning.",
        "Countries that consume more chocolate have more Nobel laureates per capita.",
        "Bigger fires have more firefighters present and cause more damage.",
        "Students who bring two pencils to an exam tend to score higher.",
    ];
    const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const isQuotaError = (text) => /HTTP 429|HTTP 402|quota|RESOURCE_EXHAUSTED|Too Many Requests|Payment Required|Insufficient Balance/i.test(String(text || ""));

    const [scenarios, setScenarios] = React.useState(initialScenarios);
    const [feedback, setFeedback] = React.useState({});
    const [loading, setLoading] = React.useState(false);
    // Practice problem state
    const [practiceScenario, setPracticeScenario] = React.useState(null);
    const [practiceLoading, setPracticeLoading] = React.useState(false);
    const [practiceChoice, setPracticeChoice] = React.useState(null);
    const [practiceResult, setPracticeResult] = React.useState(null); // { correct: boolean|null, explanation: string }
    const [practiceError, setPracticeError] = React.useState("");
    const [practiceInfo, setPracticeInfo] = React.useState("");

    // Handle user selection
    const handleSelection = async (id, selectedType) => {
        const scenario = scenarios.find(s => s.id === id);
        if (!scenario) return;

        const isCorrect = scenario.correctType === selectedType;
        setFeedback(prev => ({
            ...prev,
            [id]: { status: isCorrect ? "success" : "error", text: isCorrect ? "Correct!" : "Incorrect. Try again!" }
        }));

        // Fetch explanation from Gemini API
        const prompt = `Explain why "${scenario.name}" is ${selectedType === "correlation" ? "Correlation Only" : "Causation Likely"} in statistics. Mention confounding variables if applicable, and keep it under 120 words.`;
        setLoading(true);
        const explanation = await callGeminiAPI(prompt);
        setFeedback(prev => ({
            ...prev,
            [id]: { ...prev[id], explanation }
        }));
        setLoading(false);

        setTimeout(() => setFeedback(prev => ({
            ...prev,
            [id]: { ...prev[id], text: "" }
        })), 3000);
    };

    // Reset all selections and feedback
    const handleReset = () => {
        setScenarios(initialScenarios);
        setFeedback({});
    };

    // Generate a random practice problem SCENARIO ONLY (no answer or explanation)
    const fetchProblem = async () => {
        setPracticeLoading(true);
        setPracticeScenario(null);
        setPracticeChoice(null);
        setPracticeResult(null);
        setPracticeError("");
        setPracticeInfo("");
        const prompts = [
            `Generate ONLY a short, realistic scenario about correlation vs. causation. Do NOT include the answer or explanation. Return only the scenario text, no labels. Example theme: Cities with more libraries have higher crime rates.`,
            `Write only a concise scenario (no answer/explanation) about: People who sleep with their shoes on have more headaches.`,
            `Write only a concise scenario (no answer/explanation) about: Countries with more chocolate consumption have more Nobel laureates.`,
            `Write only a concise scenario (no answer/explanation) about: More firefighters present at larger fires correlates with more damage.`,
            `Write only a concise scenario (no answer/explanation) about: Students who bring pencils to exams score higher.`
        ];
        try {
            const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
            const result = await callGeminiAPI(randomPrompt);
            const content = result?.trim?.() || String(result || "");
            if (isQuotaError(content) || /^Error communicating with AI/i.test(content)) {
                setPracticeScenario(pickRandom(offlineScenarios));
                setPracticeInfo("AI quota exceeded — switched to offline practice mode.");
            } else {
                setPracticeScenario(content);
            }
        } catch (e) {
            // Use offline fallback on any failure
            setPracticeScenario(pickRandom(offlineScenarios));
            setPracticeInfo("AI unavailable — using offline practice mode.");
        } finally {
            setPracticeLoading(false);
        }
    };

    // Submit user's answer for the practice scenario and get AI evaluation
    const submitPracticeAnswer = async (choice) => {
        if (!practiceScenario || practiceLoading) return;
        setPracticeChoice(choice);
        setPracticeLoading(true);
        setPracticeResult(null);
        setPracticeError("");
        const evalPrompt = `You are evaluating a student's answer in a correlation vs. causation exercise.\n\nScenario: "${practiceScenario}"\nStudent's choice: "${choice}" (choices are strictly "Correlation Only" or "Causation Likely").\n\nReturn a strict JSON object only, no prose, with keys: correct (boolean) and explanation (string under 110 words). Example: {"correct": true, "explanation": "..."}`;
        try {
            const raw = await callGeminiAPI(evalPrompt);
            let jsonText = String(raw || "").trim();
            // Attempt to extract JSON if model wraps it
            const match = jsonText.match(/\{[\s\S]*\}/);
            if (match) jsonText = match[0];
            let parsed = null;
            try { parsed = JSON.parse(jsonText); } catch (_) { /* fall through */ }
            if (parsed && typeof parsed.correct !== 'undefined' && typeof parsed.explanation === 'string') {
                setPracticeResult({ correct: !!parsed.correct, explanation: parsed.explanation });
            } else {
                // If quota error text appears, use offline evaluator
                if (isQuotaError(raw)) {
                    const assumed = "Correlation Only"; // conservative default
                    const correct = choice === assumed;
                    const explanation = `Offline mode: Without AI, we default to Correlation Only unless a randomized experiment or clear mechanism is described. In this scenario, a third variable (like season, size, or motivation) can explain the association. Correlation does not imply causation.`;
                    setPracticeResult({ correct, explanation });
                    setPracticeInfo((prev) => prev || "AI quota exceeded — used offline evaluator.");
                } else {
                    // Fallback: treat entire response as explanation when JSON parsing fails
                    setPracticeResult({ correct: null, explanation: String(raw) });
                }
            }
        } catch (e) {
            // Offline evaluator on failure
            const assumed = "Correlation Only";
            const correct = choice === assumed;
            const explanation = `Offline mode: We infer this is more likely correlation due to possible confounders or reverse causality. Without experimental evidence, avoid causal claims.`;
            setPracticeResult({ correct, explanation });
            setPracticeInfo((prev) => prev || "AI unavailable — used offline evaluator.");
        } finally {
            setPracticeLoading(false);
        }
    };

    return (
        React.createElement(Box, { sx: { p: 2 } },
            React.createElement(Typography, { variant: "body1", paragraph: true },
                "[cite_start]A core theme in statistics is that correlation does not imply causation. Just because two things are associated doesn't mean one causes the other. Read each scenario and decide if it's Correlation Only or Causation Likely. [cite: 338-339]"
            ),
            React.createElement(Box, { sx: { minHeight: "60px", mb: 2, display: "flex", flexWrap: "wrap", gap: 1 } },
                scenarios.map((scenario) => (
                    React.createElement(Box, { key: scenario.id, sx: { display: "flex", flexDirection: "column", alignItems: "center" } },
                        React.createElement(Paper, { elevation: 2, sx: { p: 1, mb: 1, borderRadius: 8 } },
                            React.createElement(Typography, { variant: "body2" }, scenario.name)
                        ),
                        React.createElement(Box, { sx: { display: "flex", gap: 1 } },
                            React.createElement(Button,
                                { variant: "outlined",
                                color: "primary",
                                onClick: () => handleSelection(scenario.id, "correlation"),
                                disabled: !!feedback[scenario.id]?.text },
                                "Correlation Only"
                            ),
                            React.createElement(Button,
                                { variant: "outlined",
                                color: "secondary",
                                onClick: () => handleSelection(scenario.id, "causation"),
                                disabled: !!feedback[scenario.id]?.text },
                                "Causation Likely"
                            )
                        ),
                        feedback[scenario.id]?.text && (
                            React.createElement(AnimatePresence, null,
                                React.createElement(motion.div,
                                    { initial: { opacity: 0, y: 10 },
                                    animate: { opacity: 1, y: 0 },
                                    exit: { opacity: 0, y: -10 },
                                    sx: { mt: 1 } },
                                    React.createElement(Alert, { severity: feedback[scenario.id].status, sx: { fontSize: "0.875rem" } },
                                        feedback[scenario.id].text
                                    )
                                )
                            )
                        ),
                        feedback[scenario.id]?.explanation && (
                            React.createElement(Paper, { elevation: 1, sx: { p: 1, mt: 1, bgcolor: "grey.100", maxWidth: 300 } },
                                React.createElement(Typography, { variant: "caption", color: "text.secondary" },
                                    feedback[scenario.id].explanation
                                )
                            )
                        )
                    )
                ))
            ),
            React.createElement(Box, { sx: { mt: 2, display: "flex", gap: 1, flexWrap: "wrap" } },
                React.createElement(Button, { variant: "outlined", color: "primary", onClick: handleReset }, "Reset"),
                React.createElement(Button, { variant: "outlined", color: "primary", onClick: fetchProblem, disabled: practiceLoading },
                    "Generate Practice Problem"
                )
            ),
            practiceLoading && React.createElement(CircularProgress, { size: 24, sx: { mt: 2 } }),
            practiceError && React.createElement(Alert, { severity: "error", sx: { mt: 2 } }, practiceError),
            practiceInfo && React.createElement(Alert, { severity: "info", sx: { mt: 2 } }, practiceInfo),
            practiceScenario && (
                React.createElement(Box, { sx: { mt: 2 } },
                    React.createElement(Paper, { elevation: 2, sx: { p: 2, bgcolor: "grey.100" } },
                        React.createElement(Typography, { variant: "subtitle2", gutterBottom: true }, "Practice Scenario"),
                        React.createElement(Typography, { variant: "body2", sx: { whiteSpace: "pre-wrap" } }, practiceScenario)
                    ),
                    !practiceResult && (
                        React.createElement(Box, { sx: { display: "flex", gap: 1, mt: 1 } },
                            React.createElement(Button, { variant: "contained", color: "primary", disabled: practiceLoading, onClick: () => submitPracticeAnswer("Correlation Only") }, "Correlation Only"),
                            React.createElement(Button, { variant: "contained", color: "secondary", disabled: practiceLoading, onClick: () => submitPracticeAnswer("Causation Likely") }, "Causation Likely")
                        )
                    ),
                    practiceResult && (
                        React.createElement(Box, { sx: { mt: 2 } },
                            React.createElement(Alert, { severity: practiceResult.correct === true ? "success" : practiceResult.correct === false ? "error" : "info" },
                                practiceChoice ? `You answered: ${practiceChoice}.` : null,
                                " ",
                                practiceResult.correct === true ? "Correct!" : practiceResult.correct === false ? "Incorrect." : "Here's some feedback:"
                            ),
                            React.createElement(Paper, { elevation: 1, sx: { p: 1, mt: 1, bgcolor: "grey.100" } },
                                React.createElement(Typography, { variant: "caption", color: "text.secondary", sx: { whiteSpace: "pre-wrap" } }, practiceResult.explanation)
                            )
                        )
                    )
                )
            )
        )
    );
}

    function NotesDialog({ open, onClose, notes, setNotes }) {
        const [newNote, setNewNote] = React.useState("");
        const [selectedNote, setSelectedNote] = React.useState(null);
        const [elaboration, setElaboration] = React.useState("");
        const [loading, setLoading] = React.useState(false);
        const handleAddNote = () => { if (newNote.trim()) { setNotes((prev) => [...prev, { id: Date.now(), text: newNote }]); setNewNote(""); } };
        const handleElaborate = async () => { if (!selectedNote) return; setLoading(true); setElaboration(""); const prompt = `A student is studying Charles Wheelan's "Naked Statistics" and wrote this note: "${selectedNote.text}". Please elaborate on this note with more context or examples from the book or general statistics. Keep it concise.`; const result = await callGeminiAPI(prompt); setElaboration(result); setLoading(false); };
        const handleSelectNote = (note) => { setSelectedNote(note); setElaboration(""); };
        const handleDeleteNote = (id) => { setNotes((prev) => prev.filter((note) => note.id !== id)); if (selectedNote && selectedNote.id === id) { setSelectedNote(null); setElaboration(""); } };
        return (
            React.createElement(Dialog, { open: open, onClose: onClose, fullWidth: true, maxWidth: "md" },
                React.createElement(DialogTitle, null, "My Study Notes"),
                React.createElement(DialogContent, null,
                    React.createElement(Grid, { container: true, spacing: 2 },
                        React.createElement(Grid, { item: true, xs: 12, md: 5 },
                            React.createElement(TextField, { label: "New Note", multiline: true, rows: 3, fullWidth: true, value: newNote, onChange: (e) => setNewNote(e.target.value), variant: "outlined", margin: "normal" }),
                            React.createElement(Button, { onClick: handleAddNote, variant: "contained" }, "Add Note"),
                            React.createElement(List, { sx: { mt: 2 } },
                                React.createElement(ListSubheader, null, "Saved Notes"),
                                notes.map((note) => (
                                    React.createElement(ListItem, { key: note.id, button: true, selected: selectedNote && selectedNote.id === note.id, onClick: () => handleSelectNote(note), secondaryAction: React.createElement(IconButton, { edge: "end", "aria-label": "delete", onClick: () => handleDeleteNote(note.id) }, React.createElement("i", { className: "material-icons" }, "delete")) },
                                        React.createElement(ListItemText, { primary: note.text })
                                    )
                                ))
                            )
                        ),
                        React.createElement(Grid, { item: true, xs: 12, md: 7 }, selectedNote && (
                            React.createElement(Box, null,
                                React.createElement(Typography, { variant: "h6" }, "Elaboration"),
                                React.createElement(Button, { onClick: handleElaborate, disabled: loading, sx: { my: 1 } }, loading ? React.createElement(CircularProgress, { size: 24 }) : "Elaborate with AI"),
                                elaboration && React.createElement(Paper, { elevation: 1, sx: { p: 2, backgroundColor: "grey.100" } }, React.createElement(Typography, { variant: "body2" }, elaboration))
                            )
                        ))
                    )
                ),
                React.createElement(DialogActions, null, React.createElement(Button, { onClick: onClose }, "Close"))
            )
        );
    }

    const quizQuestions = [ { question: "In the Monty Hall problem, what are your chances of winning if you switch doors?", options: ["1/3", "1/2", "2/3", "1/4"], answer: "2/3" }, { question: "What is the key principle behind 'Garbage in, garbage out'?", options: ["Data analysis is always messy", "The quality of your conclusions depends on the quality of your data", "More data is always better", "Statistics can prove anything"], answer: "The quality of your conclusions depends on the quality of your data" }, { question: "Which measure of 'central tendency' is heavily affected by outliers like a billionaire's income?", options: ["Median", "Mode", "Mean", "Range"], answer: "Mean" }, { question: "A Gini index of 0 represents...", options: ["Perfect inequality", "Perfect equality", "Moderate inequality", "High economic growth"], answer: "Perfect equality" }, { question: "What is a major limitation of descriptive statistics like a batting average?", options: ["They are always inaccurate", "They are too complex", "They simplify information, losing nuance and detail", "They are only useful in sports"], answer: "They simplify information, losing nuance and detail" } ];
    // --- Enhanced Quiz (replaces basic QuizDialog) ---
    const ItemTypesQuiz = { TERM: 'term' };
    function Term({ id, term, isDropped }) {
        const [{ isDragging }, drag] = useDrag(() => ({
            type: ItemTypesQuiz.TERM,
            item: { id, term, type: 'bank' },
            collect: (m) => ({ isDragging: !!m.isDragging() })
        }));
        return React.createElement('div', { ref: drag, style: {
            padding: '8px 12px', margin: 6, borderRadius: 8, cursor: isDropped ? 'not-allowed' : 'grab',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)', fontSize: 14, opacity: isDragging ? 0.5 : 1,
            background: isDropped ? '#e0e0e0' : '#fff'
        } }, term);
    }
    function DroppedTerm({ termData, definitionIndex }) {
        const [{ isDragging }, drag] = useDrag(() => ({
            type: ItemTypesQuiz.TERM,
            item: { ...termData, type: 'slot', originalDefinitionIndex: definitionIndex },
            collect: (m) => ({ isDragging: !!m.isDragging() })
        }));
        return React.createElement('div', { ref: drag, style: {
            padding: '6px 10px', background: '#e3f2fd', borderRadius: 6, textAlign: 'center', cursor: 'grab', opacity: isDragging ? 0.6 : 1
        } }, termData.term);
    }
    function DefinitionSlot({ definition, onDrop, droppedTerm, definitionIndex }) {
        const [{ isOver }, drop] = useDrop(() => ({
            accept: ItemTypesQuiz.TERM,
            drop: (item) => onDrop(definitionIndex, item),
            collect: (m) => ({ isOver: !!m.isOver() })
        }));
        return React.createElement('div', { ref: drop, style: {
            display: 'flex', alignItems: 'center', padding: 12, borderRadius: 8,
            background: isOver ? 'rgba(76,175,80,0.15)' : 'rgba(0,0,0,0.04)', margin: '8px 0'
        } },
            React.createElement('div', { style: { flex: 1, border: '2px dashed #bbb', borderRadius: 8, minHeight: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12 } },
                droppedTerm ? React.createElement(DroppedTerm, { termData: droppedTerm, definitionIndex }) : React.createElement('span', { style: { color: '#9e9e9e' } }, 'Drop here')
            ),
            React.createElement('div', { style: { flex: 1, color: '#424242' } }, definition.definition)
        );
    }

    const quizData = {
        introduction: {
            title: 'Introduction Quiz',
            questions: {
                multipleChoice: [
                    { question: "Why did the author hate high school calculus?", options: ["The teacher was bad", "No one explained its purpose", "It was too abstract", "He failed the class"], answer: "No one explained its purpose", hint: "The author wanted to know 'why' he needed to learn it.", explanation: "Wheelan recounts his frustration with calculus because no one explained its real-world relevance, unlike physics which had clear applications." },
                    { question: "What subject did the author love despite it using calculus?", options: ["Economics", "Probability", "Physics", "Biology"], answer: "Physics", hint: "It had practical uses like estimating home run distances.", explanation: "Physics appealed to the author because it applied calculus to tangible problems, such as using acceleration formulas during the World Series." },
                    { question: "What famous probability problem is discussed?", options: ["Prisoner's Dilemma", "Monty Hall Problem", "Birthday Paradox", "Gambler's Fallacy"], answer: "Monty Hall Problem", hint: "It involves doors, a car, and goats on a game show.", explanation: "The Monty Hall Problem from 'Let's Make a Deal' illustrates counterintuitive probability; switching doors increases winning chances to 2/3." },
                    { question: "What is the 'paradox of statistics' according to Wheelan?", options: ["They are everywhere but seen as boring", "They always lie", "They require advanced math", "They are only for experts"], answer: "They are everywhere but seen as boring", hint: "Think batting averages vs. academic reputation.", explanation: "Statistics are ubiquitous (sports, polls) but the discipline is often viewed as uninteresting due to jargon-heavy teaching." },
                    { question: "How does the author explain an infinite series converging?", options: ["Popcorn popping", "Halving distance to a wall", "SAT scores", "Heights of men"], answer: "Halving distance to a wall", hint: "You get closer forever but total distance is finite.", explanation: "By repeatedly halving the remaining distance to a wall, the series 1 + 1/2 + 1/4 + ... sums to 2 feet, demonstrating convergence." },
                    { question: "Why does the author compare statistics to a high-caliber weapon?", options: ["It's always dangerous", "Helpful if used right, disastrous if misused", "It's outdated", "Only experts can handle it"], answer: "Helpful if used right, disastrous if misused", hint: "Focus on potential for good or harm.", explanation: "Statistics can uncover truths but, if misused (e.g., ignoring confounders like smoking in break-cancer link), lead to disastrous conclusions." },
                    { question: "What promise does each chapter make?", options: ["Provide proofs", "Answer 'What's the point?'", "Teach advanced formulas", "Focus on history"], answer: "Answer 'What's the point?'", hint: "Ties back to calculus frustration.", explanation: "Wheelan promises to explain the practical purpose of statistical concepts, addressing his calculus gripe." },
                    { question: "What makes math understandable per the author?", options: ["Formulas alone", "Intuition first", "Lots of graphs", "Technical details"], answer: "Intuition first", hint: "It's not the other way around.", explanation: "Understanding the 'why' and intuition behind stats makes the math accessible, not vice versa." },
                    { question: "What absurd example shows statistical misuse?", options: ["Coffee causes cancer", "Breaks at work cause cancer", "Exercise shortens life", "Reading improves vision"], answer: "Breaks at work cause cancer", hint: "Confounded by smoking during breaks.", explanation: "A hypothetical study linking breaks to cancer ignores that many breaks involve smoking, the real culprit." },
                    { question: "Who said 'It's easy to lie with statistics, but hard to tell the truth without them'?", options: ["Mark Twain", "Andrejs Dunkels", "Monty Hall", "Wheelan"], answer: "Andrejs Dunkels", hint: "A Swedish mathematician.", explanation: "Wheelan quotes Dunkels to highlight stats' dual nature: prone to abuse but essential for truth." }
                ],
                fillInTheBlank: [
                    { question: "The author hated ______ but loves statistics.", answer: "calculus", hint: "Story about a final exam mix-up.", explanation: "Wheelan's calculus anecdote shows his dislike due to lack of purpose, contrasting with stats' applicability." },
                    { question: "Statistics can explain everything from DNA testing to the idiocy of playing the ______.", answer: "lottery", hint: "Involves poor probability understanding.", explanation: "Stats shows why lotteries are a bad bet due to low probabilities." },
                    { question: "The sum of the infinite series 1 + 1/2 + 1/4 + ... converges to ______.", answer: "2", hint: "Wall-walking example.", explanation: "Demonstrates how infinite steps can yield a finite sum." },
                    { question: "Data is merely the raw material of ______.", answer: "knowledge", hint: "Needs stats to become useful.", explanation: "Quote emphasizing stats' role in turning data into insights." },
                    { question: "It's easy to lie with statistics, but hard to tell the truth without ______.", answer: "them", hint: "Dunkels' quote.", explanation: "Highlights stats' indispensability despite misuse potential." },
                    { question: "The book is short on math, equations, and ______.", answer: "graphs", hint: "Focuses on intuition.", explanation: "Wheelan prioritizes examples over technical elements." },
                    { question: "Statistics are everywhere, from batting averages to presidential ______.", answer: "polls", hint: "Common real-life example.", explanation: "Illustrates stats' ubiquity in daily life." },
                    { question: "The area beneath a ______? Who cares?", answer: "parabola", hint: "Calculus frustration.", explanation: "Symbolizes lack of explained purpose in calculus." },
                    { question: "The calculus teacher's name was Carol ______.", answer: "Smith", hint: "Story about exam mistake.", explanation: "The teacher's comeuppance is a highlight for the author." },
                    { question: "Statistics is like a high-caliber ______.", answer: "weapon", hint: "Helpful or disastrous.", explanation: "Metaphor for power and potential misuse." }
                ],
                trueFalse: [
                    { question: "The author liked his calculus teacher.", answer: "False", hint: "He scheduled assemblies to cancel class.", explanation: "Wheelan admits to disliking her and pranking her." },
                    { question: "Physics has real-world applications.", answer: "True", hint: "Home run distance example.", explanation: "Unlike pure calculus, physics applied math practically." },
                    { question: "Statistics is always difficult.", answer: "False", hint: "Most isn't, per the author.", explanation: "Wheelan argues stats are interesting and accessible with intuition." },
                    { question: "Infinite series always diverge.", answer: "False", hint: "Some converge, like the wall example.", explanation: "Key math camp epiphany." },
                    { question: "Statistics can be misused.", answer: "True", hint: "High-caliber weapon metaphor.", explanation: "Core warning: precision without accuracy misleads." },
                    { question: "The book is a textbook.", answer: "False", hint: "Liberated from textbook format.", explanation: "Focuses on relevance, not comprehensive coverage." },
                    { question: "A prayer study cost $2.4 million.", answer: "True", hint: "Example of expensive experiment.", explanation: "Illustrates challenges in statistical research." },
                    { question: "The author went to math camp.", answer: "True", hint: "Before graduate school.", explanation: "Where he had the infinite series insight." },
                    { question: "Statistics has a reputation for being uninteresting.", answer: "True", hint: "The paradox.", explanation: "Despite everyday use." },
                    { question: "The author loves numbers for their own sake.", answer: "False", hint: "Needs real-world application.", explanation: "Not impressed by fancy formulas alone." }
                ],
                matching: {
                    prompt: 'Match the concept to its description from the introduction.',
                    items: [
                        { id: 'm1', term: 'Calculus' }, { id: 'm2', term: 'Physics' }, { id: 'm3', term: 'Monty Hall Problem' }, { id: 'm4', term: 'Infinite Series' }, { id: 'm5', term: 'Data' }, { id: 'm6', term: 'Statistics' }, { id: 'm7', term: 'Intuition' }, { id: 'm8', term: 'Math Camp' }, { id: 'm9', term: "Let's Make a Deal" }, { id: 'm10', term: 'High-Caliber Weapon' }
                    ],
                    definitions: [
                        { id: 'd1', definition: 'Hated subject due to lack of explained purpose.', correctMatch: 'm1' }, { id: 'd2', definition: 'Loved for real-world applications like home runs.', correctMatch: 'm2' }, { id: 'd3', definition: 'Probability puzzle with doors and goats.', correctMatch: 'm3' }, { id: 'd4', definition: 'Sums to finite despite infinite terms (wall example).', correctMatch: 'm4' }, { id: 'd5', definition: 'Raw material of knowledge.', correctMatch: 'm5' }, { id: 'd6', definition: 'Everywhere but often seen as boring.', correctMatch: 'm6' }, { id: 'd7', definition: 'Key to making math understandable.', correctMatch: 'm7' }, { id: 'd8', definition: 'Pre-grad school where series epiphany happened.', correctMatch: 'm8' }, { id: 'd9', definition: 'Game show for Monty Hall Problem.', correctMatch: 'm9' }, { id: 'd10', definition: 'Metaphor for stats: helpful or disastrous.', correctMatch: 'm10' }
                    ]
                }
            }
        },
        chapter1: {
            title: 'Chapter 1 Quiz',
            questions: {
                multipleChoice: [
                    { question: "What is the 'point' of statistics per Chapter 1?", options: ["Do math for fun", "Process and summarize data", "Always find truth", "Predict future"], answer: "Process and summarize data", hint: "Turns info into meaning.", explanation: "Wheelan explains stats summarize data, make decisions, answer questions, spot patterns, evaluate policies." },
                    { question: "What is GPA an example of?", options: ["Perfect measure", "Descriptive statistic", "Probability tool", "Regression"], answer: "Descriptive statistic", hint: "Summarizes academic performance.", explanation: "GPA is a descriptive statistic but imperfect, ignoring course difficulty." },
                    { question: "What does the Gini index measure?", options: ["Sports talent", "Income inequality", "Weather", "Grades"], answer: "Income inequality", hint: "0 = equality, 1 = max inequality.", explanation: "Used to compare wealth distribution; US is .45, Sweden .23." },
                    { question: "Hal Varian called statistician the ______ job.", options: ["boring", "sexy", "hard", "obsolete"], answer: "sexy", hint: "Google chief economist quote.", explanation: "Due to data explosion, stats is increasingly vital." },
                    { question: "What is sampling for?", options: ["Full census", "Inferring from small to large", "Exact counts", "Sports only"], answer: "Inferring from small to large", hint: "Like polling or homeless counts.", explanation: "Efficient way to estimate population traits without counting everyone." },
                    { question: "Probability is the foundation for which industries?", options: ["Casinos and insurance", "Schools", "Farms", "Art"], answer: "Casinos and insurance", hint: "Manages risk.", explanation: "Casinos profit long-term; insurance premiums exceed expected payouts." },
                    { question: "What does Caveon use data forensics for?", options: ["Cheating detection", "Weather prediction", "Sports stats", "Cooking"], answer: "Cheating detection", hint: "Unlikely patterns in tests.", explanation: "Flags identical wrong answers or better on hard questions." },
                    { question: "Controlled experiments are not ethical for testing?", options: ["Beneficial drugs", "Harmful outcomes on humans", "Plant growth", "Software testing"], answer: "Harmful outcomes on humans", hint: "Can't test smoking-cancer directly.", explanation: "Ethics prevent knowingly harming subjects; use observation/regression instead." },
                    { question: "What does regression analysis isolate?", options: ["Variables while controlling others", "Absolute truths", "Random events", "Sports scores"], answer: "Variables while controlling others", hint: "Like CSI for data.", explanation: "Quantifies associations, e.g., bran muffins and colon cancer risk." },
                    { question: "Krueger's terrorism study found terrorists are often from what background?", options: ["Poor families", "Educated middle-class", "Uneducated rich", "Random"], answer: "Educated middle-class", hint: "Not poverty-driven.", explanation: "Terrorists often well-educated, motivated by politics/repression." }
                ],
                fillInTheBlank: [
                    { question: "Passer rating is a ______ statistic.", answer: "descriptive", hint: "Summarizes QB performance.", explanation: "Combines completion rate, yards, TDs, INTs into one number." },
                    { question: "A Gini index of 0 means perfect ______.", answer: "equality", hint: "Everyone has same wealth.", explanation: "1 means one person has all." },
                    { question: "Per capita income = total income / ______.", answer: "population", hint: "Average but skewed by rich.", explanation: "Not the income of average person if inequality high." },
                    { question: "Hal Varian: Statistician is the ______ job.", answer: "sexy", hint: "Next decade's hot role.", explanation: "Due to data growth." },
                    { question: "Polling is a form of ______.", answer: "sampling", hint: "Represents larger group.", explanation: "1,000 can mirror US opinions." },
                    { question: "Casinos make money in the long ______.", answer: "run", hint: "Probabilities favor house.", explanation: "Despite short-term wins." },
                    { question: "Caveon detects ______ in tests.", answer: "cheating", hint: "Data forensics.", explanation: "Unlikely patterns like same wrong answers." },
                    { question: "Controlled ______ are the gold standard for hypotheses.", answer: "experiment", hint: "Gold standard but ethical limits.", explanation: "Can't do harmful ones on humans." },
                    { question: "Regression is for analyzing variable ______.", answer: "relationships", hint: "Controls for others.", explanation: "Like smoking-cancer, holding diet constant." },
                    { question: "Terrorists are often from ______ families.", answer: "middle-class", hint: "Educated, not poor.", explanation: "Krueger's finding." }
                ],
                trueFalse: [
                    { question: "The passer rating is a perfect measure of a QB.", answer: "False", hint: "Flawed, arbitrary.", explanation: "Weights inputs; alternatives possible." },
                    { question: "A Gini index of 1 means perfect equality.", answer: "False", hint: "Opposite: max inequality.", explanation: "0 = equality." },
                    { question: "Data is the same as knowledge.", answer: "False", hint: "Raw material needing stats.", explanation: "Stats processes data." },
                    { question: "A GPA reflects the difficulty of courses taken.", answer: "False", hint: "Doesn't adjust for rigor.", explanation: "Honor classes may weight more, but basic GPA doesn't." },
                    { question: "Sampling can be as accurate as a full census.", answer: "True", hint: "If done right.", explanation: "Cheaper, faster." },
                    { question: "Probability can be used to catch cheats.", answer: "True", hint: "Unlikely patterns.", explanation: "Like lottery wins or test answers." },
                    { question: "It is ethical to conduct experiments with expected harmful outcomes on humans.", answer: "False", hint: "Medical ethics forbid.", explanation: "Use observation instead." },
                    { question: "Regression analysis proves causation.", answer: "False", hint: "Shows association.", explanation: "Can't always confirm cause-effect." },
                    { question: "Terrorists are typically poor and uneducated.", answer: "False", hint: "Often opposite.", explanation: "Middle-class, educated." },
                    { question: "The point of statistics is to process data/information.", answer: "True", hint: "Fancy name for information.", explanation: "Core point." }
                ],
                matching: {
                    prompt: 'Match the term to its concept from Chapter 1.',
                    items: [
                        { id: 'm1', term: 'Descriptive Statistics' }, { id: 'm2', term: 'Gini Index' }, { id: 'm3', term: 'Sampling' }, { id: 'm4', term: 'Inference' }, { id: 'm5', term: 'Probability' }, { id: 'm6', term: 'Regression Analysis' }, { id: 'm7', term: 'Controlled Experiment' }, { id: 'm8', term: 'Index' }, { id: 'm9', term: 'Data Forensics' }, { id: 'm10', term: 'Unit of Analysis' }
                    ],
                    definitions: [
                        { id: 'd1', definition: 'Summarizes data like GPA or passer rating.', correctMatch: 'm1' }, { id: 'd2', definition: 'Measures income inequality (0-1 scale).', correctMatch: 'm2' }, { id: 'd3', definition: 'Gathers small data for large inferences.', correctMatch: 'm3' }, { id: 'd4', definition: 'Known to unknown world conjectures.', correctMatch: 'm4' }, { id: 'd5', definition: 'Foundation for casinos/insurance risk.', correctMatch: 'm5' }, { id: 'd6', definition: 'Isolates variable relationships.', correctMatch: 'm6' }, { id: 'd7', definition: 'Gold standard for causality testing.', correctMatch: 'm7' }, { id: 'd8', definition: 'Combines stats like HDI.', correctMatch: 'm8' }, { id: 'd9', definition: 'Detects cheating patterns.', correctMatch: 'm9' }, { id: 'd10', definition: 'Entity described (e.g., schools vs. students).', correctMatch: 'm10' }
                    ]
                }
            }
        }
    };

    function EnhancedQuizDialog({ open, onClose, setQuizScores }) {
        const ToneJS = window.Tone;
        const [screen, setScreen] = React.useState('home'); // 'home' | 'quiz' | 'results'
        const [currentQuizId, setCurrentQuizId] = React.useState(null);
        const [answers, setAnswers] = React.useState({});
        const [results, setResults] = React.useState(null); // { score, total }
        const [timeLeft, setTimeLeft] = React.useState(0);
        const [hintsUsed, setHintsUsed] = React.useState({});
        const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
        const timerRef = React.useRef(null);

        const quiz = currentQuizId ? quizData[currentQuizId] : null;
        const allQuestions = quiz ? [
            ...quiz.questions.multipleChoice.map((q, i) => ({ ...q, type: 'multipleChoice', originalIndex: i, section: 'Multiple Choice' })),
            ...quiz.questions.fillInTheBlank.map((q, i) => ({ ...q, type: 'fillInTheBlank', originalIndex: i, section: 'Fill in the Blank' })),
            ...quiz.questions.trueFalse.map((q, i) => ({ ...q, type: 'trueFalse', originalIndex: i, section: 'True/False' })),
            { ...quiz.questions.matching, type: 'matching', originalIndex: 0, section: 'Matching' }
        ] : [];

        React.useEffect(() => {
            if (open) {
                setScreen('home'); setCurrentQuizId(null); setResults(null); setAnswers({}); setHintsUsed({}); setCurrentQuestionIndex(0); setTimeLeft(0);
            }
        }, [open]);

        React.useEffect(() => {
            if (screen === 'quiz' && timeLeft > 0) {
                timerRef.current = setInterval(() => setTimeLeft((p) => p - 1), 1000);
            } else if (timeLeft === 0 && screen === 'quiz') {
                if (timerRef.current) clearInterval(timerRef.current);
                calculateScore();
            }
            return () => { if (timerRef.current) clearInterval(timerRef.current); };
        }, [screen, timeLeft, allQuestions.length]);

        const playComplete = async () => {
            try { if (!ToneJS) return; await ToneJS.start(); const s = new ToneJS.Synth().toDestination(); const now = ToneJS.now(); s.triggerAttackRelease('C4','8n',now); s.triggerAttackRelease('E4','8n',now+0.2); s.triggerAttackRelease('G4','8n',now+0.4);} catch(e){/* ignore */}
        };

        const startQuiz = (quizId) => {
            setCurrentQuizId(quizId);
            setAnswers({ matching: Array(quizData[quizId].questions.matching.definitions.length).fill(null) });
            setResults(null); setCurrentQuestionIndex(0); setTimeLeft(30*60); setHintsUsed({}); setScreen('quiz');
        };
        const handleAnswerChange = (qIndex, qType, value) => setAnswers((p) => ({ ...p, [`${qType}-${qIndex}`]: value }));
        const handleMatchingDrop = (targetIndex, item) => setAnswers((prev) => { const newM = [...(prev.matching||[])]; const t = { id: item.id, term: item.term }; if (item.type==='slot'){ const oi=item.originalDefinitionIndex; [newM[oi], newM[targetIndex]]=[newM[targetIndex], newM[oi]];} else { newM[targetIndex]=t;} return { ...prev, matching: newM }; });
        const handleReturnTerm = (item) => setAnswers((prev) => { const newM=[...(prev.matching||[])]; newM[item.originalDefinitionIndex]=null; return { ...prev, matching:newM }; });
        const useHint = () => setHintsUsed((p) => ({ ...p, [currentQuestionIndex]: true }));
        const nextQuestion = () => { if (currentQuestionIndex < allQuestions.length - 1) setCurrentQuestionIndex((p)=>p+1); };
        const previousQuestion = () => { if (currentQuestionIndex > 0) setCurrentQuestionIndex((p)=>p-1); };

        const calculateScore = () => {
            if (!quiz) return; let s = 0; const q = quiz.questions;
            q.multipleChoice.forEach((qq,i)=>{ if (answers[`multipleChoice-${i}`]===qq.answer) s++; });
            q.fillInTheBlank.forEach((qq,i)=>{ if ((answers[`fillInTheBlank-${i}`]||'').trim().toLowerCase()===qq.answer.toLowerCase()) s++; });
            q.trueFalse.forEach((qq,i)=>{ if (answers[`trueFalse-${i}`]===qq.answer) s++; });
            (answers.matching||[]).forEach((d,i)=>{ if (d && d.id===q.matching.definitions[i].correctMatch) s++; });
            playComplete(); setResults({ score: s, total: (q.multipleChoice.length+q.fillInTheBlank.length+q.trueFalse.length+q.matching.definitions.length) }); setScreen('results'); setTimeLeft(0);
            setQuizScores && setQuizScores((prev)=>[...(prev||[]), { score: s, total: (q.multipleChoice.length+q.fillInTheBlank.length+q.trueFalse.length+q.matching.definitions.length), date: new Date().toISOString() }]);
        };

        const sectionProgress = { 'Multiple Choice':{start:0,end: (quiz?quiz.questions.multipleChoice.length-1:0)}, 'Fill in the Blank':{start:(quiz?quiz.questions.multipleChoice.length:0), end:(quiz?quiz.questions.multipleChoice.length+quiz.questions.fillInTheBlank.length-1:0)}, 'True/False':{ start:(quiz?quiz.questions.multipleChoice.length+quiz.questions.fillInTheBlank.length:0), end:(quiz?quiz.questions.multipleChoice.length+quiz.questions.fillInTheBlank.length+quiz.questions.trueFalse.length-1:0)}, 'Matching':{ start:(quiz?allQuestions.length-1:0), end:(quiz?allQuestions.length-1:0)} };

        const renderHome = () => (
            React.createElement(Box, { sx:{ p:2, textAlign:'center' }},
                React.createElement(Typography, { variant:'h6', gutterBottom:true }, 'Choose a Quiz'),
                React.createElement(Box, { sx:{ display:'flex', gap:2, justifyContent:'center' }},
                    React.createElement(Button, { variant:'contained', onClick:()=>startQuiz('introduction') }, 'Introduction Quiz'),
                    React.createElement(Button, { variant:'contained', color:'secondary', onClick:()=>startQuiz('chapter1') }, 'Chapter 1 Quiz')
                )
            )
        );

        const renderQuestion = (question) => {
            const { type, originalIndex } = question;
            if (type==='multipleChoice') {
                return React.createElement(Box, { sx:{ display:'flex', flexDirection:'column' } },
                    question.options.map((opt, j)=> React.createElement(ListItem, { key:j, button:true, selected: answers[`multipleChoice-${originalIndex}`]===opt, onClick: ()=>handleAnswerChange(originalIndex, 'multipleChoice', opt) }, React.createElement(ListItemText, { primary: opt })))
                );
            }
            if (type==='fillInTheBlank') {
                return React.createElement(TextField, { fullWidth:true, value: (answers[`fillInTheBlank-${originalIndex}`]||''), onChange:(e)=>handleAnswerChange(originalIndex,'fillInTheBlank',e.target.value), placeholder:'Type your answer...' });
            }
            if (type==='trueFalse') {
                return React.createElement(Box, { sx:{ display:'flex', gap:2, justifyContent:'space-around' } }, ['True','False'].map((val)=> React.createElement(Button, { key:val, variant: (answers[`trueFalse-${originalIndex}`]===val?'contained':'outlined'), color: val==='True'?'success':'error', onClick: ()=>handleAnswerChange(originalIndex,'trueFalse',val) }, val)));
            }
            if (type==='matching') {
                const currentMatchingAnswers = answers.matching || [];
                const droppedTermIds = new Set(currentMatchingAnswers.filter(Boolean).map((t)=>t.id));
                return React.createElement(DndProvider, { backend: DnDBackend },
                    React.createElement(Box, { sx:{ display:'flex', gap:2, flexDirection:{ xs:'column', md:'row' } } },
                        React.createElement(Box, { sx:{ flex:{md:'0 0 33%'}, p:2, borderRadius:2, bgcolor:'grey.100' } },
                            React.createElement(Typography, { variant:'subtitle1', align:'center', gutterBottom:true }, 'Terms'),
                            React.createElement(Box, { sx:{ display:'grid', gridTemplateColumns:'repeat(2, minmax(0,1fr))' } }, question.items.map((t)=> React.createElement(Term, { key:t.id, id:t.id, term:t.term, isDropped: droppedTermIds.has(t.id) })))
                        ),
                        React.createElement(Box, { sx:{ flex:1 } },
                            React.createElement(Typography, { variant:'subtitle1', align:'center', gutterBottom:true }, 'Definitions'),
                            question.definitions.map((def, i)=> React.createElement(DefinitionSlot, { key:def.id, definition:def, onDrop:handleMatchingDrop, droppedTerm: currentMatchingAnswers[i], definitionIndex:i }))
                        )
                    )
                );
            }
            return null;
        };

        const renderQuiz = () => {
            if (!quiz || !allQuestions.length) return null;
            const question = allQuestions[currentQuestionIndex];
            const progress = ((currentQuestionIndex + 1) / allQuestions.length) * 100;
            return React.createElement(Box, { sx:{ p:2 } },
                React.createElement(Box, { sx:{ mb:2 } },
                    React.createElement(Box, { sx:{ display:'flex', justifyContent:'space-between', alignItems:'center' } },
                        React.createElement(Typography, { variant:'h6' }, quiz.title),
                        React.createElement(Box, { sx:{ fontWeight:700, px:2, py:0.5, borderRadius: 999, bgcolor:'primary.light' } }, `${Math.floor(timeLeft/60)}:${('0'+timeLeft%60).slice(-2)}`)
                    ),
                    React.createElement(Box, { sx:{ width:'100%', height:10, bgcolor:'grey.300', borderRadius:5, mt:1 } }, React.createElement('div', { style:{ width: `${progress}%`, height:'100%', background:'#66bb6a', borderRadius:5 } }))
                ),
                React.createElement(AnimatePresence, { mode:'wait' },
                    React.createElement(motion.div, { key: currentQuestionIndex, initial:{ opacity:0, x: 40 }, animate:{ opacity:1, x:0 }, exit:{ opacity:0, x:-40 }, transition:{ duration:0.25 } },
                        React.createElement(Typography, { variant:'body1', sx:{ mb:2 } }, `${currentQuestionIndex + 1}. ${question.type==='matching' ? question.prompt : question.question}`),
                        renderQuestion(question),
                        React.createElement(Box, { sx:{ mt:3, display:'flex', justifyContent:'space-between', alignItems:'center' } },
                            React.createElement(Button, { onClick: previousQuestion, disabled: currentQuestionIndex===0 }, 'Back'),
                            question.type!=='matching' ? React.createElement(Button, { onClick: useHint, disabled: !!hintsUsed[currentQuestionIndex] }, hintsUsed[currentQuestionIndex] ? (question.hint || 'Hint used') : 'Hint') : React.createElement('span'),
                            currentQuestionIndex < allQuestions.length - 1 ? React.createElement(Button, { variant:'contained', onClick: nextQuestion }, 'Next') : React.createElement(Button, { variant:'contained', color:'success', onClick: calculateScore }, 'Submit')
                        )
                    )
                )
            );
        };

        const renderResults = () => {
            if (!results || !quiz) return null; const pct = ((results.score/results.total)*100).toFixed(1);
            return React.createElement(Box, { sx:{ p:2, textAlign:'center' } },
                React.createElement(Typography, { variant:'h5', gutterBottom:true }, 'Quiz Results'),
                React.createElement(Paper, { elevation:2, sx:{ p:3, display:'inline-block', mb:2 } },
                    React.createElement(Typography, { variant:'h6' }, `You scored:`),
                    React.createElement(Typography, { variant:'h3', sx:{ color:'primary.main', my:1 } }, `${results.score} / ${results.total}`),
                    React.createElement(Typography, { variant:'h4', sx:{ color: results.score/results.total>=0.8 ? 'success.main' : results.score/results.total>=0.5 ? 'warning.main' : 'error.main' } }, `${pct}%`)
                ),
                React.createElement(Button, { onClick: ()=>{ setScreen('home'); setCurrentQuizId(null); }, variant:'contained' }, 'Back to Quiz Menu')
            );
        };

        const handleClose = () => { if (timerRef.current) clearInterval(timerRef.current); onClose(); };

        return React.createElement(Dialog, { open, onClose: handleClose, fullWidth: true, maxWidth: 'md' },
            React.createElement(DialogTitle, null, 'Quiz'),
            React.createElement(DialogContent, null,
                screen==='home' && renderHome(),
                screen==='quiz' && renderQuiz(),
                screen==='results' && renderResults()
            ),
            React.createElement(DialogActions, null,
                React.createElement(Button, { onClick: handleClose }, 'Close')
            )
        );
    }

    function App() {
        const [tab, setTab] = React.useState(0);
        const [darkMode, setDarkMode] = useLocalStorage("stats-app-dark-mode", false);
        const [notesOpen, setNotesOpen] = React.useState(false);
        const [quizOpen, setQuizOpen] = React.useState(false);
        const [notes, setNotes] = useLocalStorage("stats-app-notes", []);
        const [quizScores, setQuizScores] = useLocalStorage("stats-app-scores", []);
        const theme = React.useMemo(() => createTheme({ palette: { mode: darkMode ? "dark" : "light" } }), [darkMode]);
        // Resolve UMD backend functions reliably
        const html5Fn = (typeof HTML5Backend === 'function') ? HTML5Backend : (HTML5Backend && HTML5Backend.HTML5Backend);
        const touchFn = (typeof TouchBackend === 'function') ? TouchBackend : (TouchBackend && TouchBackend.TouchBackend);
        const dndProps = (isMobile && typeof touchFn === 'function')
            ? { backend: touchFn, options: { enableMouseEvents: true } }
            : { backend: html5Fn };
        const handleTabChange = (event, newValue) => setTab(newValue);
        return (
            React.createElement(ThemeProvider, { theme: theme },
                React.createElement(DndProvider, dndProps,
                    React.createElement(CssBaseline, null),
                    React.createElement(AppBar, { position: "static" },
                        React.createElement(Toolbar, null,
                            React.createElement(Typography, { variant: "h6", component: "div", sx: { flexGrow: 1 } }, "Naked Statistics: An Interactive Guide"),
                            React.createElement(FormControlLabel, { control: React.createElement(Switch, { checked: darkMode, onChange: () => setDarkMode(!darkMode) }), label: darkMode ? "Dark Mode" : "Light Mode" }),
                            React.createElement(Button, { color: "inherit", onClick: () => setNotesOpen(true) }, "Notes"),
                            React.createElement(Button, { color: "inherit", onClick: () => setQuizOpen(true) }, "Start Quiz")
                        )
                    ),
                    React.createElement(Container, { maxWidth: "md", sx: { mt: 4 } },
                        React.createElement(Box, { sx: { borderBottom: 1, borderColor: "divider" } },
                            React.createElement(Tabs, { value: tab, onChange: handleTabChange, "aria-label": "content tabs" }, React.createElement(Tab, { label: "Introduction" }), React.createElement(Tab, { label: "Chapter 1: What's the Point?" }))
                        ),
                        React.createElement(Box, { sx: { pt: 3 } },
                            tab === 0 && React.createElement(Box, null,
                                React.createElement(ModuleCard, { title: "Infinite Series Simulation" }, React.createElement(InfiniteSeriesSim, null)),
                                React.createElement(ModuleCard, { title: "Narrative Nuggets" }, React.createElement(NarrativeNuggets, null)),
                                React.createElement(ModuleCard, { title: "Key Ideas" }, React.createElement(KeyIdeas, null)),
                                React.createElement(ModuleCard, { title: "Flashcards" }, React.createElement(FlashcardModule, { cards: introductionFlashcards }))
                            ),
                            tab === 1 && React.createElement(Box, null,
                                React.createElement(ModuleCard, { title: "Mean vs. Median Simulation" }, React.createElement(MeanMedianSim, null)),
                                React.createElement(ModuleCard, { title: "Gini Index Explorer" }, React.createElement(GiniIndexExplorer, null)),
                                React.createElement(ModuleCard, { title: "Spot the Statistic Game" }, React.createElement(SpotTheStatistic, null)),
                                React.createElement(ModuleCard, { title: "Correlation vs. Causation Matcher" }, React.createElement(CorrelationCausationMatcher, null))
                            )
                        )
                    ),
                    React.createElement(NotesDialog, { open: notesOpen, onClose: () => setNotesOpen(false), notes: notes, setNotes: setNotes }),
                    React.createElement(EnhancedQuizDialog, { open: quizOpen, onClose: () => setQuizOpen(false), setQuizScores: setQuizScores })
                )
            )
        );
    }

    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(React.createElement(App));
};


