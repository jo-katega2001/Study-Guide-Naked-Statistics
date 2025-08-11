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
        // Position as a percent toward the wall (0..100)
        const [position, setPosition] = React.useState(0);
        const [steps, setSteps] = React.useState(0);
        const totalDistance = 100;

        // Measure container to animate in pixels reliably
        const containerRef = React.useRef(null);
        const [containerWidth, setContainerWidth] = React.useState(0);
        React.useEffect(() => {
            const measure = () => setContainerWidth(containerRef.current?.clientWidth || 0);
            measure();
            window.addEventListener('resize', measure);
            return () => window.removeEventListener('resize', measure);
        }, []);

        // core logic: step halfway based on previous position
        const handleStep = () => {
            setPosition(prev => {
                const remaining = totalDistance - prev;
                return prev + remaining / 2;
            });
            setSteps(s => s + 1);
        };

        const handleReset = () => { setPosition(0); setSteps(0); };

        const remainingDistance = totalDistance - position;

        // Convert percentage to pixels, accounting for icon and wall widths (each ~5%)
        const wallPx = containerWidth * 0.05;
        const iconPx = containerWidth * 0.05;
        const maxX = Math.max(0, containerWidth - wallPx - iconPx);
        const xPx = (position / 100) * maxX;

        return (
            React.createElement(Box, null,
                React.createElement(Typography, { variant: "body1", paragraph: true },
                    "[cite_start]Charles Wheelan explains the concept of a converging infinite series with an analogy: imagine you are 2 feet from a wall. You move half the distance (1 foot), then half the remaining distance (6 inches), and so on. You will get infinitely close, but never hit it. The total distance you travel will never be more than 2 feet. [cite: 117-126]"
                ),

                // --- VISUAL SIMULATION AREA ---
                React.createElement(Box, { ref: containerRef, sx: { position: "relative", height: "80px", border: "1px solid", borderColor: "divider", borderRadius: "4px", my: 2, p: 1, overflow: "hidden" } },
                    // Person icon animated in pixels
                    React.createElement(motion.div, {
                        initial: { x: 0 },
                        animate: { x: xPx },
                        transition: { type: 'spring', stiffness: 100, damping: 15 },
                        style: { position: 'absolute', bottom: '10px', width: '5%', display: 'flex', justifyContent: 'center', left: 0 }
                    }, React.createElement("i", { className: "material-icons", style: { fontSize: '40px' } }, "directions_walk")),
                    // Wall
                    React.createElement(Box, { sx: { position: 'absolute', right: 0, top: 0, height: '100%', width: '5%', backgroundColor: 'grey.400', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
                        React.createElement(Typography, { variant: 'caption', sx: { writingMode: 'vertical-rl', textOrientation: 'mixed', color: 'black' } }, 'WALL')
                    )
                ),

                // --- STATS DISPLAY ---
                React.createElement(Grid, { container: true, spacing: 2, textAlign: 'center' },
                    React.createElement(Grid, { item: true, xs: 6 },
                        React.createElement(Typography, { variant: 'body2' }, 'Steps Taken: ', React.createElement('strong', null, steps))
                    ),
                    React.createElement(Grid, { item: true, xs: 6 },
                        React.createElement(Typography, { variant: 'body2' }, 'Remaining Distance: ', React.createElement('strong', null, remainingDistance.toFixed(4)), '%')
                    )
                ),

                // --- CONTROLS ---
                React.createElement(Box, { sx: { display: 'flex', justifyContent: 'center', gap: 2, mt: 3 } },
                    React.createElement(Button, { variant: 'contained', onClick: handleStep, disabled: remainingDistance < 0.001 }, 'Move Halfway'),
                    React.createElement(Button, { variant: 'outlined', onClick: handleReset }, 'Reset')
                )
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
    function QuizDialog({ open, onClose, setQuizScores }) {
        const [currentQuestion, setCurrentQuestion] = React.useState(0);
        const [selectedAnswer, setSelectedAnswer] = React.useState(null);
        const [score, setScore] = React.useState(0);
        const [showResult, setShowResult] = React.useState(false);

        const handleNext = () => {
            if (selectedAnswer === quizQuestions[currentQuestion].answer) {
                setScore((prev) => prev + 1);
            }
            setSelectedAnswer(null);
            if (currentQuestion < quizQuestions.length - 1) {
                setCurrentQuestion((prev) => prev + 1);
            } else {
                setShowResult(true);
            }
        };

        React.useEffect(() => {
            if (showResult) {
                setQuizScores((prev) => [
                    ...prev,
                    { score, total: quizQuestions.length, date: new Date().toISOString() },
                ]);
            }
        }, [showResult]);

        const handleClose = () => {
            setCurrentQuestion(0);
            setSelectedAnswer(null);
            setScore(0);
            setShowResult(false);
            onClose();
        };

        return React.createElement(
            Dialog,
            { open, onClose: handleClose, fullWidth: true },
            React.createElement(DialogTitle, null, "Quick Quiz"),
            React.createElement(
                DialogContent,
                null,
                showResult
                    ? React.createElement(
                          Box,
                          null,
                          React.createElement(Typography, { variant: "h5" }, "Quiz Complete!"),
                          React.createElement(
                              Typography,
                              { variant: "h6" },
                              `Your Score: ${score} / ${quizQuestions.length}`
                          )
                      )
                    : React.createElement(
                          Box,
                          null,
                          React.createElement(
                              Typography,
                              { variant: "h6" },
                              `${currentQuestion + 1}. ${quizQuestions[currentQuestion].question}`
                          ),
                          React.createElement(
                              List,
                              null,
                              quizQuestions[currentQuestion].options.map((option) =>
                                  React.createElement(
                                      ListItem,
                                      {
                                          key: option,
                                          button: true,
                                          selected: selectedAnswer === option,
                                          onClick: () => setSelectedAnswer(option),
                                      },
                                      React.createElement(ListItemText, { primary: option })
                                  )
                              )
                          )
                      )
            ),
            React.createElement(
                DialogActions,
                null,
                !showResult
                    ? React.createElement(
                          Button,
                          { onClick: handleNext, disabled: !selectedAnswer },
                          "Next"
                      )
                    : null,
                React.createElement(Button, { onClick: handleClose }, "Close")
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
                    React.createElement(QuizDialog, { open: quizOpen, onClose: () => setQuizOpen(false), setQuizScores: setQuizScores })
                )
            )
        );
    }

    const root = ReactDOM.createRoot(document.getElementById("root"));
    root.render(React.createElement(App));
};


