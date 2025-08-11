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

    const DndProvider = __dnd.DndProvider || (({ children }) => React.createElement(React.Fragment, null, children));
    const useDrag = __dnd.useDrag || (() => ([{ isDragging: false }, () => {}]));
    const useDrop = __dnd.useDrop || (() => ([{ isOver: false }, () => {}]));
    const HTML5Backend = __dndHtml5.HTML5Backend || {};

    // --- GEMINI API HELPER ---
    const GEMINI_API_KEY = "GEMINI_API_KEY"; // <<< IMPORTANT: REPLACE WITH YOUR API KEY

    async function callGeminiAPI(prompt, maxRetries = 3, initialDelay = 1000) {
        if (GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
            console.error("Gemini API key not set.");
            return "Error: Gemini API key is not configured. Please add it to the script.";
        }

    // Additional Chapter 1 visual: Normal Curve coverage by standard deviations
    function NormalCurveExplorer() {
        const [stdDevs, setStdDevs] = React.useState(1); // 1..3
        const labels = { 1: "68.2%", 2: "95.4%", 3: "99.7%" };

        return (
            React.createElement(Box, null,
                React.createElement(Typography, { variant: "body1", paragraph: true },
                    "See how much data falls within 1, 2, or 3 standard deviations (σ) of the mean under a normal curve."
                ),
                React.createElement(Box, { sx: { width: "100%", my: 2 } },
                    React.createElement("svg", { viewBox: "0 0 200 100", style: { width: "100%", height: "160px" } },
                        React.createElement("path", { d: "M 0 100 C 40 100, 40 10, 100 10 C 160 10, 160 100, 200 100 Z", stroke: "#1976d2", strokeWidth: 2, fill: "none" }),
                        React.createElement(motion.path, { d: "M 0 100 C 40 100, 40 10, 100 10 C 160 10, 160 100, 200 100 Z", fill: "#1976d2", fillOpacity: 0.25, animate: { clipPath: `inset(0 ${100 - (50 + stdDevs * 15)}% 0 ${50 - stdDevs * 15}%)` }, transition: { duration: 0.5 } }),
                        React.createElement("line", { x1: 100, y1: 10, x2: 100, y2: 100, stroke: "grey", strokeDasharray: "2" }),
                        React.createElement("text", { x: 95, y: 95, fontSize: 8 }, "μ")
                    )
                ),
                React.createElement(Typography, { variant: "h6", align: "center", sx: { fontWeight: 700, color: "primary.main" } }, labels[stdDevs]),
                React.createElement(Box, { sx: { px: 2, mt: 2 } },
                    React.createElement(Slider, { value: stdDevs, onChange: (e, v) => setStdDevs(v), step: 1, marks: true, min: 1, max: 3, valueLabelDisplay: "auto" })
                )
            )
        );
    }
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
        let delay = initialDelay;

        for (let i = 0; i < maxRetries; i++) {
            try {
                const response = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                if (data.candidates && data.candidates.length > 0) {
                    return data.candidates[0].content.parts[0].text;
                } else {
                    return "No response from AI.";
                }
            } catch (error) {
                console.error(`Attempt ${i + 1} failed:`, error);
                if (i < maxRetries - 1) {
                    await new Promise((resolve) => setTimeout(resolve, delay));
                    delay *= 2; // Exponential backoff
                } else {
                    return `Error communicating with AI after ${maxRetries} attempts.`;
                }
            }
        }
    }

    // --- CUSTOM HOOKS ---
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

    // --- STYLED COMPONENTS AND CONTENT ---
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

    // --- UI COMPONENTS ---
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

    // --- INTRODUCTION MODULES ---
    function InfiniteSeriesSim() {
        // State for the person's position (0 = start, 100 = at the wall)
        const [position, setPosition] = React.useState(0);
        const [steps, setSteps] = React.useState(0);
        const totalDistance = 100;

        // Measure container and animate in pixels for reliability across browsers
        const containerRef = React.useRef(null);
        const [containerWidth, setContainerWidth] = React.useState(0);
        React.useEffect(() => {
            const measure = () => setContainerWidth(containerRef.current?.clientWidth || 0);
            measure();
            window.addEventListener('resize', measure);
            return () => window.removeEventListener('resize', measure);
        }, []);

        // Compute pixel translateX so the icon stops before the wall (both ~5% width)
        const wallPx = containerWidth * 0.05;
        const iconPx = containerWidth * 0.05;
        const maxX = Math.max(0, containerWidth - wallPx - iconPx);
        const xPx = (position / 100) * maxX;

        // Safer functional updates
        const handleStep = () => {
            setPosition(prevPosition => {
                const remaining = totalDistance - prevPosition;
                return prevPosition + remaining / 2;
            });
            setSteps(prevSteps => prevSteps + 1);
        };

        const handleReset = () => {
            setPosition(0);
            setSteps(0);
        };

        const remainingDistance = totalDistance - position;

        return (
            React.createElement(Box, null,
                React.createElement(Typography, { variant: "body1", paragraph: true },
                    "[cite_start]\"Charles Wheelan explains the concept of a converging infinite series with an analogy: imagine you are 2 feet from a wall. You move half the distance (1 foot), then half the remaining distance (6 inches), and so on. You will get infinitely close, but never hit it. The total distance you travel will never be more than 2 feet. [cite: 117-126]\""
                ),

                // --- VISUAL SIMULATION AREA ---
                React.createElement(Box, { ref: containerRef, sx: { position: "relative", height: "80px", border: "1px solid", borderColor: "divider", borderRadius: "4px", my: 2, p: 1, overflow: "hidden" } },
                    // Person icon animated with pixel-based translateX
                    React.createElement(motion.div, {
                        initial: { left: "0%" },
                        animate: { left: `${position}%` },
                        transition: { type: "spring", stiffness: 100, damping: 15 },
                        style: { position: "absolute", bottom: "10px", left: `${position}%`, width: "5%", display: 'flex', justifyContent: 'center' }
                    }, React.createElement("i", { className: "material-icons", style: { fontSize: '40px' } }, "directions_walk")),

                    // --- The "Wall" ---
                    React.createElement(Box, { sx: { position: "absolute", right: 0, top: 0, height: "100%", width: "5%", backgroundColor: "grey.400", display: 'flex', alignItems: 'center', justifyContent: 'center' } },
                        React.createElement(Typography, { variant: "caption", sx: { writingMode: 'vertical-rl', textOrientation: 'mixed', color: 'black' } }, "WALL")
                    )
                ),

                // --- STATS DISPLAY ---
                React.createElement(Grid, { container: true, spacing: 2, textAlign: "center" },
                    React.createElement(Grid, { item: true, xs: 6 },
                        React.createElement(Typography, { variant: "body2" }, "Steps Taken: ", React.createElement("strong", null, steps))
                    ),
                    React.createElement(Grid, { item: true, xs: 6 },
                        React.createElement(Typography, { variant: "body2" }, "Remaining Distance: ", React.createElement("strong", null, remainingDistance.toFixed(4)), "%")
                    )
                ),

                // --- CONTROLS ---
                React.createElement(Box, { sx: { display: "flex", justifyContent: "center", gap: 2, mt: 3 } },
                    React.createElement(Button, { variant: "contained", onClick: handleStep, disabled: remainingDistance < 0.001 }, "Move Halfway"),
                    React.createElement(Button, { variant: "outlined", onClick: handleReset }, "Reset")
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
                        React.createElement(Typography, { variant: "body2" },
                            "[cite_start]The author recounts the joy of his high school calculus teacher accidentally giving the class the *second* semester final exam instead of the first, validating his feeling that he needed to understand the \"point\" of what he was learning, not just memorize formulas. This experience contrasted with physics, where formulas had clear, cool applications, like calculating the distance of a home run. [cite: 44-71]"
                        )
                    )
                ),
                React.createElement(motion.div, { whileHover: { scale: 1.02 }, transition: { type: "spring", stiffness: 300 } },
                    React.createElement(Paper, { elevation: 2, sx: { p: 2 } },
                        React.createElement(Typography, { variant: "h6" }, "The Monty Hall Problem"),
                        React.createElement(Typography, { variant: "body2" },
                            "Introduced through the game show \"Let's Make a Deal,\" this classic probability puzzle illustrates how intuition can be misleading. A contestant chooses one of three doors. The host, who knows where the prize is, opens another door to reveal a goat. The contestant is then asked if they want to switch their choice. [cite_start]The counter-intuitive answer is YES—switching doubles your chance of winning from 1/3 to 2/3. [cite: 80-93]"
                        )
                    )
                )
            )
        );
    }

    function KeyIdeas() {
        return (
            React.createElement(List, null,
                React.createElement(ListItem, null,
                    React.createElement(ListItemText, { primary: "Statistics is About Intuition", secondary: "The book's core promise is to make statistical concepts intuitive and accessible, arguing that understanding the 'why' makes the technical details easier to grasp. [cite: 99, 132]" })
                ),
                React.createElement(ListItem, null,
                    React.createElement(ListItemText, { primary: "Data Quality is Paramount", secondary: "The principle of 'Garbage in, garbage out' is central. [cite_start]Sophisticated statistical techniques are useless if the underlying data is poor, leading to wildly misleading conclusions. [cite: 24, 135]" })
                ),
                React.createElement(ListItem, null,
                    React.createElement(ListItemText, { primary: "The Duality of Statistics", secondary: "As Andrejs Dunkels noted, 'It's easy to lie with statistics, but it's hard to tell the truth without them.' [cite_start]The book aims to equip readers to spot misuse while appreciating the power of data for good. [cite: 154]" })
                )
            )
        );
    }

    function Flashcard({ card, isFlipped, onFlip }) {
        return (
            React.createElement("div", { className: "flashcard-container", onClick: onFlip },
                React.createElement(motion.div, { className: `flashcard ${isFlipped ? "flipped" : ""}`, initial: false, animate: { rotateY: isFlipped ? 180 : 0 }, transition: { duration: 0.6, ease: "easeInOut" } },
                    React.createElement(Paper, { className: "flashcard-face flashcard-front", elevation: 4 },
                        React.createElement(Typography, { variant: "h6" }, card.term)
                    ),
                    React.createElement(Paper, { className: "flashcard-face flashcard-back", elevation: 4, sx: { backgroundColor: "grey.200" } },
                        React.createElement(Typography, { variant: "body2" }, card.definition)
                    )
                )
            )
        );
    }

    function FlashcardModule({ cards }) {
        const [flippedCards, setFlippedCards] = React.useState({});
        const handleFlip = (id) => {
            setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
        };
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

    // --- CHAPTER 1 MODULES ---
    function MeanMedianSim() {
        const initialData = [35000, 35000, 35000, 35000, 35000, 35000, 35000, 35000, 35000, 35000];
        const [data, setData] = React.useState(initialData);
        const [outlierAdded, setOutlierAdded] = React.useState(false);
        const [explanation, setExplanation] = React.useState("");
        const [loading, setLoading] = React.useState(false);

        const calculateMean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
        const calculateMedian = (arr) => {
            const sorted = [...arr].sort((a, b) => a - b);
            const mid = Math.floor(sorted.length / 2);
            return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
        };

        const handleToggleOutlier = () => {
            if (outlierAdded) {
                setData(initialData);
            } else {
                setData([...initialData, 1000000000]);
            }
            setOutlierAdded(!outlierAdded);
        };

        const fetchExplanation = async () => {
            setLoading(true);
            setExplanation("");
            const prompt = `Explain the difference between mean and median like I'm 5, using a simple analogy. Refer to the idea of an 'outlier' or an extreme value. Keep it under 100 words.`;
            const result = await callGeminiAPI(prompt);
            setExplanation(result);
            setLoading(false);
        };

        const mean = calculateMean(data);
        const median = calculateMedian(data);

        return (
            React.createElement(Box, null,
                React.createElement(Typography, { variant: "body1", paragraph: true },
                    "[cite_start]The book uses a great analogy: Ten people are in a bar, each earning $35,000 a year. Their mean (average) and median (middle) income is $35,000. When Bill Gates (income ~$1B) walks in, the mean income skyrockets to over $90 million, but the median income stays at $35,000. The median is a better description of the 'typical' person in the bar. [cite: 447-461]"
                ),
                React.createElement(Grid, { container: true, spacing: 2, alignItems: "center" },
                    React.createElement(Grid, { item: true, xs: 12, md: 6 },
                        React.createElement(Typography, null, "Mean (Average): ", React.createElement("strong", null, `$${mean.toLocaleString(undefined, { maximumFractionDigits: 0 })}`)),
                        React.createElement(Typography, null, "Median (Middle Value): ", React.createElement("strong", null, `$${median.toLocaleString()}`))
                    ),
                    React.createElement(Grid, { item: true, xs: 12, md: 6 },
                        React.createElement(Button, { variant: "contained", onClick: handleToggleOutlier }, outlierAdded ? "Remove Bill Gates" : "Add Bill Gates")
                    )
                ),
                React.createElement(Box, { sx: { mt: 2, display: "flex", gap: 1 } },
                    React.createElement(Button, { variant: "outlined", size: "small", onClick: fetchExplanation, disabled: loading }, "Explain Like I'm 5")
                ),
                loading && React.createElement(CircularProgress, { size: 24, sx: { mt: 2 } }),
                explanation && React.createElement(Paper, { elevation: 1, sx: { p: 2, mt: 2, backgroundColor: "grey.100" } },
                    React.createElement(Typography, { variant: "body2" }, explanation)
                )
            )
        );
    }

    function GiniIndexExplorer() {
        const countries = [
            { name: "Sweden", gini: 0.23 },
            { name: "Canada", gini: 0.32 },
            { name: "China", gini: 0.42 },
            { name: "United States", gini: 0.45 },
            { name: "Brazil", gini: 0.54 },
            { name: "South Africa", gini: 0.65 },
        ];
        const [selectedGini, setSelectedGini] = React.useState(0.45);
        const [explanation, setExplanation] = React.useState("");
        const [problem, setProblem] = React.useState("");
        const [loading, setLoading] = React.useState({ eli5: false, problem: false });

        const handleSliderChange = (event, newValue) => {
            setSelectedGini(newValue);
        };

        const fetchExplanation = async () => {
            setLoading((prev) => ({ ...prev, eli5: true }));
            setExplanation("");
            const prompt = `Explain the Gini Index like I'm 5. Use an analogy like sharing cookies or pizza slices. A Gini of 0 is perfect sharing, and a Gini of 1 is one person getting all the cookies. Keep it under 100 words.`;
            const result = await callGeminiAPI(prompt);
            setExplanation(result);
            setLoading((prev) => ({ ...prev, eli5: false }));
        };

        const fetchProblem = async () => {
            setLoading((prev) => ({ ...prev, problem: true }));
            setProblem("");
            const prompt = `Create a simple practice problem about the Gini Index. For example: "Country A has a Gini index of 0.25 and Country B has a Gini index of 0.50. Which country has a more unequal distribution of wealth and why?" Provide the answer in a separate paragraph starting with 'Answer:'.`;
            const result = await callGeminiAPI(prompt);
            setProblem(result);
            setLoading((prev) => ({ ...prev, problem: false }));
        };

        return (
            React.createElement(Box, null,
                React.createElement(Typography, { variant: "body1", paragraph: true },
                    "[cite_start]The Gini index is a descriptive statistic that collapses complex information about a country's income distribution into a single number from 0 (perfect equality) to 1 (one person has all the wealth). It's a tool for comparison. [cite: 179-183]"
                ),
                React.createElement(Typography, { gutterBottom: true }, "Inequality Scale (0 = Equal, 1 = Unequal)"),
                React.createElement(Slider, { value: selectedGini, onChange: handleSliderChange, "aria-labelledby": "gini-slider", step: 0.01, min: 0, max: 1, valueLabelDisplay: "auto" }),
                React.createElement(Box, { sx: { display: "flex", flexWrap: "wrap", gap: 1, my: 2 } },
                    countries.map((c) => (
                        React.createElement(Chip, { key: c.name, label: `${c.name} (${c.gini})`, onClick: () => setSelectedGini(c.gini), variant: selectedGini === c.gini ? "filled" : "outlined", color: "primary" })
                    ))
                ),
                React.createElement(Box, { sx: { mt: 2, display: "flex", gap: 1 } },
                    React.createElement(Button, { variant: "outlined", size: "small", onClick: fetchExplanation, disabled: loading.eli5 }, "Explain Like I'm 5"),
                    React.createElement(Button, { variant: "outlined", size: "small", onClick: fetchProblem, disabled: loading.problem }, "Generate Practice Problem")
                ),
                loading.eli5 && React.createElement(CircularProgress, { size: 24, sx: { mt: 2 } }),
                explanation && React.createElement(Paper, { elevation: 1, sx: { p: 2, mt: 2, backgroundColor: "grey.100" } }, React.createElement(Typography, { variant: "body2" }, explanation)),
                loading.problem && React.createElement(CircularProgress, { size: 24, sx: { mt: 2 } }),
                problem && React.createElement(Paper, { elevation: 1, sx: { p: 2, mt: 2, backgroundColor: "grey.100" } }, React.createElement(Typography, { variant: "body2", sx: { whiteSpace: "pre-wrap" } }, problem))
            )
        );
    }

    function SpotTheStatistic() {
        const stats = [
            { id: 1, statement: "Jay Cutler had a passer rating of 31.8 in the 2011 playoffs. [cite: 170]", type: "Index" },
            { id: 2, statement: "The United States has a Gini index of .45, measuring income inequality. [cite: 189]", type: "Index" },
            { id: 3, statement: "Mickey Mantle was a career .298 hitter. [cite: 222]", type: "Descriptive Statistic" },
        ];
        const [currentStatIndex, setCurrentStatIndex] = React.useState(0);
        const [feedback, setFeedback] = React.useState("");

        const handleAnswer = (answer) => {
            if (answer === stats[currentStatIndex].type) {
                setFeedback("Correct!");
            } else {
                setFeedback(`Not quite! That's an example of a(n) ${stats[currentStatIndex].type}.`);
            }
            setTimeout(() => {
                setFeedback("");
                setCurrentStatIndex((prev) => (prev + 1) % stats.length);
            }, 2000);
        };

        return (
            React.createElement(Box, null,
                React.createElement(Typography, { variant: "body1", paragraph: true },
                    "Statistics are used to summarize complex information. Can you identify the type of statistic being used in these examples from the book?"
                ),
                React.createElement(Paper, { elevation: 2, sx: { p: 2, my: 2, minHeight: "80px" } },
                    React.createElement(Typography, { variant: "h6" }, `"${stats[currentStatIndex].statement}"`)
                ),
                React.createElement(Box, { sx: { display: "flex", justifyContent: "center", gap: 2 } },
                    React.createElement(Button, { variant: "contained", onClick: () => handleAnswer("Index") }, "Index"),
                    React.createElement(Button, { variant: "contained", onClick: () => handleAnswer("Descriptive Statistic") }, "Descriptive Statistic")
                ),
                feedback && React.createElement(Typography, { align: "center", sx: { mt: 2, color: feedback === "Correct!" ? "green" : "red" } }, feedback)
            )
        );
    }

    const ItemTypes = { CARD: "card" };

    function DraggableItem({ item }) {
        const [{ isDragging }, drag] = useDrag(() => ({
            type: ItemTypes.CARD,
            item: { id: item.id, type: item.type },
            collect: (monitor) => ({
                isDragging: !!monitor.isDragging(),
            }),
        }));

        return (
            React.createElement(motion.div, { ref: drag, initial: { opacity: 1, scale: 1 }, animate: { opacity: isDragging ? 0.5 : 1, scale: isDragging ? 0.95 : 1 }, whileHover: { scale: 1.05 }, className: "draggable-item" },
                React.createElement(Chip, { label: item.name, color: "secondary", sx: { m: 0.5 } })
            )
        );
    }

    function DropTarget({ type, onDrop, children, title }) {
        const [{ isOver }, drop] = useDrop(() => ({
            accept: ItemTypes.CARD,
            drop: (item) => onDrop(item, type),
            collect: (monitor) => ({
                isOver: !!monitor.isOver(),
            }),
        }));

        return (
            React.createElement(Paper, { ref: drop, elevation: 2, className: `drop-target ${isOver ? "drop-target-hover" : ""}`, sx: { p: 2, flex: 1 } },
                React.createElement(Typography, { variant: "h6", align: "center", gutterBottom: true }, title),
                React.createElement(Box, { sx: { display: "flex", flexWrap: "wrap", justifyContent: "center" } }, children)
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
        const [scenarios, setScenarios] = React.useState(initialScenarios);
        const [feedback, setFeedback] = React.useState({});
        const [problem, setProblem] = React.useState({ scenario: "", correct: "", explanation: "" });
        const [userAnswer, setUserAnswer] = React.useState(null);
        const [showFeedback, setShowFeedback] = React.useState(false);
        const [loading, setLoading] = React.useState(false);

        // Handle user selection for main scenarios
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
            setProblem({ scenario: "", correct: "", explanation: "" });
            setUserAnswer(null);
            setShowFeedback(false);
        };

        // Generate a practice problem scenario (without revealing the answer)
        const fetchProblem = async () => {
            setLoading(true);
            setProblem({ scenario: "", correct: "", explanation: "" });
            setUserAnswer(null);
            setShowFeedback(false);
            
            const scenarioPrompts = [
                "Create a correlation vs. causation scenario about libraries and crime rates in cities. Just describe the relationship observed, don't reveal whether it's correlation or causation.",
                "Generate a scenario about chocolate consumption and Nobel Prize winners by country. Describe the statistical relationship without explaining the cause.",
                "Create a scenario about firefighters and property damage at fire scenes. Present the observed relationship without analysis.",
                "Generate a scenario about students bringing school supplies and test performance. Just state the observed pattern.",
                "Create a scenario about ice cream sales and drowning incidents. Present the statistical relationship only.",
                "Generate a scenario about TV watching time and academic grades. Describe what researchers observed.",
                "Create a scenario about city park quantity and resident happiness levels. State the correlation found.",
                "Generate a scenario about umbrella sales and cold/flu cases. Present the observed relationship.",
            ];
            
            const randomPrompt = scenarioPrompts[Math.floor(Math.random() * scenarioPrompts.length)];
            const fullPrompt = `${randomPrompt} Keep it concise (2-3 sentences max) and engaging. End with: "Is this correlation or causation?"`;
            
            try {
                const scenario = await callGeminiAPI(fullPrompt);
                setProblem({ scenario: scenario.trim(), correct: "", explanation: "" });
            } catch (error) {
                console.error("Failed to generate scenario:", error);
                setProblem({ scenario: "Error generating problem. Please try again or check your API connection.", correct: "", explanation: "" });
            }
            setLoading(false);
        };

        // Handle user answer and get AI evaluation
        const handleProblemAnswer = async (selectedType) => {
            setUserAnswer({ selectedType, isCorrect: null });
            setLoading(true);
            
            // Ask Gemini to evaluate the user's answer
            const evaluationPrompt = `
            Scenario: "${problem.scenario}"
            
            The student answered: "${selectedType === 'correlation' ? 'Correlation Only' : 'Causation Likely'}"
            
            Please evaluate this answer and respond with:
            1. Whether they are CORRECT or INCORRECT
            2. A detailed explanation of why, mentioning confounding variables, third variables, or causal mechanisms as appropriate
            3. Keep the explanation educational and under 150 words
            
            Format: Start with either "CORRECT:" or "INCORRECT:" then provide the explanation.
            `;
            
            try {
                const evaluation = await callGeminiAPI(evaluationPrompt);
                const isCorrect = evaluation.toLowerCase().startsWith('correct:');
                const explanation = evaluation.replace(/^(correct:|incorrect:)\s*/i, '');
                
                setUserAnswer({ selectedType, isCorrect });
                setProblem(prev => ({ ...prev, explanation }));
                setShowFeedback(true);
            } catch (error) {
                console.error("Failed to evaluate answer:", error);
                setUserAnswer({ selectedType, isCorrect: false });
                setProblem(prev => ({ ...prev, explanation: "Error evaluating your answer. Please try again." }));
                setShowFeedback(true);
            }
            setLoading(false);
        };

        return (
            React.createElement(Box, { sx: { p: 2 } },
                React.createElement(Typography, { variant: "body1", paragraph: true },
                    "[cite_start]A core theme in statistics is that correlation does not imply causation. Just because two things are associated doesn't mean one causes the other. Read each scenario and decide if it's Correlation Only or Causation Likely. [cite: 338-339]"
                ),
                React.createElement(Box, { sx: { minHeight: "60px", mb: 2, display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" } },
                    scenarios.map((scenario) => (
                        React.createElement(Box, { key: scenario.id, sx: { display: "flex", flexDirection: "column", alignItems: "center", width: { xs: "100%", sm: "auto" } } },
                            React.createElement(Paper, { elevation: 2, sx: { p: 1, mb: 1, borderRadius: 8, minWidth: 200, textAlign: "center" } },
                                React.createElement(Typography, { variant: "body2" }, scenario.name)
                            ),
                            React.createElement(Box, { sx: { display: "flex", gap: 1 } },
                                React.createElement(Button,
                                    { variant: "outlined",
                                    color: "primary",
                                    onClick: () => handleSelection(scenario.id, "correlation"),
                                    disabled: !!feedback[scenario.id]?.text,
                                    "aria-label": `Select Correlation Only for ${scenario.name}` },
                                    "Correlation Only"
                                ),
                                React.createElement(Button,
                                    { variant: "outlined",
                                    color: "secondary",
                                    onClick: () => handleSelection(scenario.id, "causation"),
                                    disabled: !!feedback[scenario.id]?.text,
                                    "aria-label": `Select Causation Likely for ${scenario.name}` },
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
                    React.createElement(Button, { variant: "outlined", color: "primary", onClick: handleReset, "aria-label": "Reset all selections" },
                        "Reset"
                    ),
                    React.createElement(Button,
                        { variant: "outlined",
                        color: "primary",
                        onClick: fetchProblem,
                        disabled: loading,
                        "aria-label": "Generate a new practice problem" },
                        "Generate Practice Problem"
                    )
                ),
                loading && React.createElement(CircularProgress, { size: 24, sx: { mt: 2 } }),
                problem.scenario && (
                    React.createElement(Paper, { elevation: 2, sx: { p: 2, mt: 2, bgcolor: "grey.100" } },
                        React.createElement(Typography, { variant: "h6", gutterBottom: true }, "Practice Problem"),
                        React.createElement(Typography, { variant: "body1", paragraph: true }, problem.scenario),
                        !showFeedback && (
                            React.createElement(Box, { sx: { display: "flex", gap: 1, mt: 2 } },
                                React.createElement(Button, { variant: "outlined", color: "primary", onClick: () => handleProblemAnswer("correlation") },
                                    "Correlation Only"
                                ),
                                React.createElement(Button, { variant: "outlined", color: "secondary", onClick: () => handleProblemAnswer("causation") },
                                    "Causation Likely"
                                )
                            )
                        ),
                        showFeedback && (
                            React.createElement(Box, { sx: { mt: 2 } },
                                React.createElement(Alert, { severity: userAnswer.isCorrect ? "success" : "error" },
                                    userAnswer.isCorrect ? "Correct!" : "Incorrect."
                                ),
                                React.createElement(Typography, { variant: "body2", sx: { mt: 1 } },
                                    problem.explanation
                                )
                            )
                        )
                    )
                )
            )
        );
    }

    // --- DIALOGS AND TABS ---
    function NotesDialog({ open, onClose, notes, setNotes }) {
        const [newNote, setNewNote] = React.useState("");
        const [selectedNote, setSelectedNote] = React.useState(null);
        const [elaboration, setElaboration] = React.useState("");
        const [loading, setLoading] = React.useState(false);

        const handleAddNote = () => {
            if (newNote.trim()) {
                setNotes((prev) => [...prev, { id: Date.now(), text: newNote }]);
                setNewNote("");
            }
        };

        const handleElaborate = async () => {
            if (!selectedNote) return;
            setLoading(true);
            setElaboration("");
            const prompt = `A student is studying Charles Wheelan's "Naked Statistics" and wrote this note: "${selectedNote.text}". Please elaborate on this note with more context or examples from the book or general statistics. Keep it concise.`;
            const result = await callGeminiAPI(prompt);
            setElaboration(result);
            setLoading(false);
        };

        const handleSelectNote = (note) => {
            setSelectedNote(note);
            setElaboration("");
        };

        const handleDeleteNote = (id) => {
            setNotes((prev) => prev.filter((note) => note.id !== id));
            if (selectedNote && selectedNote.id === id) {
                setSelectedNote(null);
                setElaboration("");
            }
        };

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
                                elaboration && React.createElement(Paper, { elevation: 1, sx: { p: 2, backgroundColor: "grey.100" } },
                                    React.createElement(Typography, { variant: "body2" }, elaboration)
                                )
                            )
                        ))
                    )
                ),
                React.createElement(DialogActions, null,
                    React.createElement(Button, { onClick: onClose }, "Close")
                )
            )
        );
    }

    const quizQuestions = [
        { question: "In the Monty Hall problem, what are your chances of winning if you switch doors?", options: ["1/3", "1/2", "2/3", "1/4"], answer: "2/3" },
        { question: "What is the key principle behind 'Garbage in, garbage out'?", options: ["Data analysis is always messy", "The quality of your conclusions depends on the quality of your data", "More data is always better", "Statistics can prove anything"], answer: "The quality of your conclusions depends on the quality of your data" },
        { question: "Which measure of 'central tendency' is heavily affected by outliers like a billionaire's income?", options: ["Median", "Mode", "Mean", "Range"], answer: "Mean" },
        { question: "A Gini index of 0 represents...", options: ["Perfect inequality", "Perfect equality", "Moderate inequality", "High economic growth"], answer: "Perfect equality" },
        { question: "What is a major limitation of descriptive statistics like a batting average?", options: ["They are always inaccurate", "They are too complex", "They simplify information, losing nuance and detail", "They are only useful in sports"], answer: "They simplify information, losing nuance and detail" },
    ];

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
                    { score: score, total: quizQuestions.length, date: new Date().toISOString() },
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

        return (
            React.createElement(Dialog, { open: open, onClose: handleClose, fullWidth: true },
                React.createElement(DialogTitle, null, "Quick Quiz"),
                React.createElement(DialogContent, null,
                    showResult
                        ? React.createElement(Box, null,
                            React.createElement(Typography, { variant: "h5" }, "Quiz Complete!"),
                            React.createElement(Typography, { variant: "h6" }, "Your Score: ", score, " / ", quizQuestions.length)
                        )
                        : React.createElement(Box, null,
                            React.createElement(Typography, { variant: "h6" }, `${currentQuestion + 1}. ${quizQuestions[currentQuestion].question}`),
                            React.createElement(List, null,
                                quizQuestions[currentQuestion].options.map((option) => (
                                    React.createElement(ListItem, { key: option, button: true, selected: selectedAnswer === option, onClick: () => setSelectedAnswer(option) },
                                        React.createElement(ListItemText, { primary: option })
                                    )
                                ))
                            )
                        )
                ),
                React.createElement(DialogActions, null,
                    !showResult && React.createElement(Button, { onClick: handleNext, disabled: !selectedAnswer }, "Next"),
                    React.createElement(Button, { onClick: handleClose }, "Close")
                )
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

        const theme = React.useMemo(
            () =>
                createTheme({
                    palette: { mode: darkMode ? "dark" : "light" },
                }),
            [darkMode]
        );

        const handleTabChange = (event, newValue) => setTab(newValue);

        return (
            React.createElement(ThemeProvider, { theme: theme },
                React.createElement(DndProvider, { backend: HTML5Backend },
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
                            React.createElement(Tabs, { value: tab, onChange: handleTabChange, "aria-label": "content tabs" },
                                React.createElement(Tab, { label: "Introduction" }),
                                React.createElement(Tab, { label: "Chapter 1: What's the Point?" })
                            )
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
                                React.createElement(ModuleCard, { title: "Normal Curve Explorer" }, React.createElement(NormalCurveExplorer, null)),
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


