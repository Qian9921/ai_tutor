"use client"
import { SuggestionFlow } from '@/app/genkit';
import React, { useRef, useState } from 'react'
import { Button } from './ui/button';
import { PaperclipIcon, SendIcon, X } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import Markdown from 'react-markdown';
import CardRecomendedPrompt from './card-recomen-chats';
import Image from 'next/image';

interface UploadedFile {
    name: string;
    type: string;
    content: string;
    url?: string;
}

const ChatMessages = () => {
    const [message, setMessage] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function sendMessage(formData: FormData) {
        try {
            setLoading(true);
            const theme = formData.get('theme')?.toString() ?? '';
            
            // Combine message with file content if available
            let prompt = theme;
            if (uploadedFile) {
                if (uploadedFile.type.startsWith('image/')) {
                    prompt = `[Image uploaded: ${uploadedFile.name}]\n\n${theme}`;
                } else {
                    prompt = `[File content: ${uploadedFile.content}]\n\n${theme}`;
                }
            }
            
            const suggestion = await SuggestionFlow(prompt);
            setMessage(suggestion);
        } catch (error) {
            console.error('Error:', error);
            setMessage('Sorry, an error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    const handleFileUpload = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                if (file.type.startsWith('image/')) {
                    // Handle image file
                    const url = URL.createObjectURL(file);
                    setUploadedFile({
                        name: file.name,
                        type: file.type,
                        content: 'Image file',
                        url: url
                    });
                } else {
                    // Handle text file
                    const content = await file.text();
                    setUploadedFile({
                        name: file.name,
                        type: file.type,
                        content: content.slice(0, 1000) // Limit content length
                    });
                }
            } catch (error) {
                console.error('Error reading file:', error);
            }
        }
    };

    const clearUploadedFile = () => {
        if (uploadedFile?.url) {
            URL.revokeObjectURL(uploadedFile.url);
        }
        setUploadedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className='flex flex-col justify-between h-[85vh] md:mx-20'>
            <ScrollArea className='space-y-4 mb-5 px-4'>
                {message ? (
                    <div className="space-y-4">
                        {uploadedFile && (
                            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium">{uploadedFile.name}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={clearUploadedFile}
                                        className="h-6 w-6"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                                {uploadedFile.type.startsWith('image/') ? (
                                    <div className="relative h-48 w-full">
                                        <Image
                                            src={uploadedFile.url!}
                                            alt={uploadedFile.name}
                                            fill
                                            className="object-contain rounded-lg"
                                        />
                                    </div>
                                ) : (
                                    <pre className="text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
                                        {uploadedFile.content}
                                    </pre>
                                )}
                            </div>
                        )}
                        <Markdown>{message}</Markdown>
                    </div>
                ) : (
                    <CardRecomendedPrompt />
                )}
            </ScrollArea>
            <form action={sendMessage} className='flex space-x-2 px-4 pb-4'>
                <label className='hidden' htmlFor="theme">
                    Enter your message:{''}
                </label>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.txt"
                />
                <Button 
                    type='button' 
                    size='icon' 
                    variant='outline' 
                    className='rounded-full'
                    onClick={handleFileUpload}
                    title="Upload file"
                >
                    <PaperclipIcon />
                </Button>
                <Input 
                    type="text" 
                    name="theme" 
                    id="theme" 
                    autoComplete="off"
                    placeholder="Type your message..."
                />
                <Button type="submit" size="icon" disabled={loading}>
                    <SendIcon className="size-4" />
                </Button>
            </form>
        </div>
    )
}

export default ChatMessages
