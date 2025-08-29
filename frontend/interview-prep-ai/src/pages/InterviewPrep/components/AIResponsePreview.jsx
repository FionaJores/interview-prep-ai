import React from 'react'
import { LuCopy, LuCheck, LuCode, LuExternalLink } from 'react-icons/lu'
import ReactMarkdown from 'react-markdown'; 
import remarkGfm from 'remark-gfm'; 
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'; 
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'; 
import { useState } from 'react';

const AIResponsePreview = ({ content }) => { 
    if (!content) return null;

    return (
        <div className="ai-response-preview bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-[15px] prose prose-indigo max-w-none"> 
                <ReactMarkdown 
                    remarkPlugins={[remarkGfm]} 
                    components={{ 
                        code({ node, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || "");
                            const language = match ? match[1] : "";
                            const isInline = !className;

                            return !isInline ? (
                                <CodeBlock
                                    code={String(children).replace(/\n$/, "")}
                                    language={language}
                                />
                            ) : (
                                <code className='inline-code px-1.5 py-0.5 bg-gray-100 rounded-md text-sm font-medium text-gray-800' {...props}>
                                    {children}
                                </code>
                            )
                        },
                        p({ children }) { 
                            return <p className="mb-5 leading-relaxed text-gray-700">{children}</p>; 
                        }, 
                        strong({ children }) { 
                            return <strong className="font-semibold text-gray-900">{children}</strong>; 
                        }, 
                        em({ children }) { 
                            return <em className="italic text-gray-800">{children}</em>; 
                        }, 
                        ul({ children }) {
                            return <ul className='list-disc pl-5 space-y-2 my-5'>{children}</ul>;
                        },
                        ol({ children }) {
                            return <ol className='list-decimal pl-5 space-y-2 my-5'>{children}</ol>;
                        },
                        li({ children }) {
                            return <li className='mb-1.5 text-gray-700'>{children}</li>;
                        },
                        blockquote({ children }) {
                            return (
                                <blockquote className='border-l-4 border-indigo-200 pl-4 italic my-6 py-1 bg-indigo-50 rounded-r text-gray-700'>
                                    {children}
                                </blockquote>
                            );
                        },
                        h1({ children }) {
                            return <h1 className='text-2xl font-bold mt-7 mb-5 text-gray-900 border-b pb-2'>{children}</h1>;
                        },
                        h2({ children }) {
                            return <h2 className='text-xl font-semibold mt-6 mb-4 text-gray-900'>{children}</h2>;
                        },
                        h3({ children }) {
                            return <h3 className='text-lg font-semibold mt-5 mb-3 text-gray-900'>{children}</h3>;
                        },
                        h4({ children }) {
                            return <h4 className='text-base font-medium mt-4 mb-2 text-gray-900'>{children}</h4>;
                        },
                        a({ children, href }) {
                            return (
                                <a 
                                    href={href} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className='text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1'
                                >
                                    {children}
                                    <LuExternalLink size={14} />
                                </a>
                            );
                        },
                        table({ children }) {
                            return(
                                <div className='overflow-x-auto my-6 rounded-lg border border-gray-200 shadow-sm'>
                                    <table className='min-w-full divide-y divide-gray-200'>
                                        {children}
                                    </table>
                                </div>
                            );
                        },
                        thead({ children }) {
                            return <thead className='bg-gray-50'>{children}</thead>;
                        },
                        tbody({ children }) {
                            return <tbody className='divide-y divide-gray-200 bg-white'>{children}</tbody>;
                        },
                        tr({ children }) {
                            return <tr>{children}</tr>;
                        },
                        th({ children }) {
                            return (
                                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                    {children}
                                </th>
                            );
                        },
                        td({ children }) {
                            return <td className='px-4 py-3 text-sm text-gray-700 whitespace-nowrap'>{children}</td>;
                        },
                        hr({ children }) {
                            return <hr className='my-6 border-gray-300'/>;
                        },
                        img({ src, alt }) {
                            return (
                                <div className="my-6 flex justify-center">
                                    <img 
                                        src={src} 
                                        alt={alt} 
                                        className='max-w-full rounded-lg shadow-sm border border-gray-200'
                                    />
                                </div>
                            );
                        }
                    }}
                >
                    {content}
                </ReactMarkdown>
            </div>
        </div>
    )
}

function CodeBlock({ code, language }) {
    const [copied, setCopied] = useState(false);

    const copyCode = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className='relative my-6 rounded-lg overflow-hidden bg-gray-50 border border-gray-200 group'>
            <div className='flex items-center justify-between px-4 py-2.5 bg-gray-100 border-b border-gray-200'>
                <div className='flex items-center space-x-2'>
                    <LuCode size={16} className='text-gray-600'/>
                    <span className='text-xs font-semibold text-gray-700 uppercase tracking-wide'>
                        {language || "code"}
                    </span>
                </div>
                <button
                    onClick={copyCode}
                    className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md transition-colors ${
                        copied 
                            ? 'text-green-700 bg-green-50' 
                            : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                    }`}
                    aria-label="Copy code"
                >
                    {copied ? (
                        <>
                            <LuCheck size={14} className='text-green-600'/>
                            <span>Copied</span>
                        </>
                    ) : (
                        <>
                            <LuCopy size={14}/>
                            <span>Copy</span>
                        </>
                    )}
                </button>
            </div>
            <SyntaxHighlighter
                language={language}
                style={oneLight}
                customStyle={{
                    fontSize: '13.5px',
                    margin: 0,
                    padding: '1.25rem',
                    background: 'transparent',
                    lineHeight: '1.5'
                }}
                wrapLongLines={true}
                showLineNumbers={code.split('\n').length > 5}
                lineNumberStyle={{ 
                    color: '#9CA3AF', 
                    paddingRight: '1rem',
                    minWidth: '2.5em'
                }}
            >
                {code}
            </SyntaxHighlighter>
        </div>
    )
}

export default AIResponsePreview;