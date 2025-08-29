import React, { useEffect, useRef, useState } from "react"; 
import { LuChevronDown, LuPin, LuPinOff, LuSparkles, LuBookOpen, LuMessageSquare } from "react-icons/lu"; 
import { motion, AnimatePresence } from "framer-motion";
import AIResponsePreview from "../../pages/InterviewPrep/components/AIResponsePreview";

const QuestionCard = ({
    question, 
    answer, 
    onLearnMore, 
    isPinned, 
    onTogglePin, 
    number
}) => { 
    const [isExpanded, setIsExpanded] = useState(false); 
    const [height, setHeight] = useState(0); 
    const contentRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => { 
        if (isExpanded && contentRef.current) { 
            const contentHeight = contentRef.current.scrollHeight; 
            setHeight(contentHeight); 
        } else { 
            setHeight(0); 
        } 
    }, [isExpanded, answer]); 

    const toggleExpand = () => { 
        setIsExpanded(!isExpanded); 
    };
    
    return (
        <motion.div 
            className="bg-white rounded-2xl mb-5 overflow-hidden p-6 shadow-sm border border-gray-100 group hover:shadow-md transition-all duration-300"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            layout
        >
            <div className="flex items-start justify-between cursor-pointer">
                <div className="flex items-start gap-4 w-full">
                    <div className={`relative flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold shadow-sm ${
                        isPinned ? 'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700' : 'bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700'
                    }`}>
                        {number}
                        {isPinned && (
                            <span className="absolute -top-2 -right-2 bg-amber-500 text-white p-1 rounded-full">
                                <LuPin size={8} />
                            </span>
                        )}
                    </div>

                    <div className="flex-grow">
                        <h3
                            className="text-base md:text-lg font-semibold text-gray-900 leading-relaxed pr-2 cursor-pointer"
                            onClick={toggleExpand}
                        >
                            {question}
                        </h3>
                    </div>
                </div>

                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                    <AnimatePresence>
                        {(isExpanded || isHovered) && (
                            <motion.div 
                                className="flex items-center gap-2"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                            >
                                <motion.button
                                    className={`p-2.5 rounded-xl transition-all shadow-sm ${
                                        isPinned 
                                            ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:shadow-lg' 
                                            : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 hover:from-gray-200 hover:to-gray-300'
                                    }`}
                                    onClick={onTogglePin}
                                    aria-label={isPinned ? "Unpin question" : "Pin question"}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {isPinned ? <LuPinOff size={18} /> : <LuPin size={18} />}
                                </motion.button>

                                <motion.button
                                    className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white hover:shadow-lg transition-all shadow-sm"
                                    onClick={() => {
                                        if (!isExpanded) toggleExpand();
                                        onLearnMore();
                                    }}
                                    aria-label="Learn more"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <LuSparkles size={18} />
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.button
                        className="p-2.5 text-gray-500 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors"
                        onClick={toggleExpand}
                        aria-label={isExpanded ? "Collapse answer" : "Expand answer"}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <LuChevronDown size={20} />
                        </motion.div>
                    </motion.button>
                </div>
            </div>

            <motion.div
                className="overflow-hidden"
                initial={false}
                animate={{ height }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
            >
                <div
                    ref={contentRef}
                    className="mt-5 text-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-5 rounded-xl border border-gray-200"
                >
                    <div className="flex items-center gap-2 mb-4 text-sm font-medium text-indigo-600">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <LuMessageSquare size={16} />
                        </div>
                        <span>Expert Answer</span>
                    </div>
                    <AIResponsePreview content={answer}/>
                </div>
            </motion.div>
        </motion.div>
    ) 
}; 

export default QuestionCard;