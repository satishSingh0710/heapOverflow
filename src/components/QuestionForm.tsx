"use client";

import RTE from "@/components/RTE";
import { Meteors } from "@/components/magicui/meteors";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { userAuthStore } from "@/store/Auth";
import { cn } from "@/lib/utils";
import slugify from "@/utils/slugify";
import { IconX } from "@tabler/icons-react";
import { Models, ID } from "appwrite";
import { useRouter } from "next/navigation";
import React from "react";
import { databases, storage } from "@/models/client/config";
import { db, questionAttachmentBucket, questionCollection } from "@/models/name";
import confetti from "canvas-confetti";

const LabelInputContainer = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <div
            className={cn(
                "relative flex w-full flex-col space-y-2 overflow-hidden rounded-lg border border-gray-700 bg-slate-900 p-5 shadow-md",
                className
            )}
        >
            <Meteors number={15} />
            {children}
        </div>
    );
};

const QuestionForm = ({ question }: { question?: Models.Document }) => {
    const router = useRouter();
    const { user } = userAuthStore();
    if(!user){
        router.push("/auth/login"); 
    }
    const [tag, setTag] = React.useState("");
    // const router = useRouter();

    const [formData, setFormData] = React.useState({
        title: String(question?.title || ""),
        content: String(question?.content || ""),
        authorId: String(user?.$id),
        tags: new Set((question?.tags || []) as string[]),
        attachment: null as File | null,
    });

    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState("");

    const loadConfetti = () => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
        });
    };

    const create = async () => {
        // console.log("The current logged in user is: ", user); 
        if (!formData.attachment) throw new Error("Please upload an image");
        console.log("The current form data is: ", formData);
        if(!user) return alert("You are not logged in"); 
        const storageResponse = await storage.createFile(
            questionAttachmentBucket,
            ID.unique(),
            formData.attachment
        );

        const response = await databases.createDocument(db, questionCollection, ID.unique(), {
            title: formData.title,
            content: formData.content,
            authorId: formData.authorId,
            tags: Array.from(formData.tags),
            attachmentId: storageResponse.$id,
        });

        loadConfetti();
        return response;
    };

    const update = async () => {
        if (!question) throw new Error("Please provide a question");

        const attachmentId = await (async () => {
            if (!formData.attachment) return question?.attachmentId as string;

            await storage.deleteFile(questionAttachmentBucket, question.attachmentId);
            const file = await storage.createFile(
                questionAttachmentBucket,
                ID.unique(),
                formData.attachment
            );

            return file.$id;
        })();

        const response = await databases.updateDocument(db, questionCollection, question.$id, {
            title: formData.title,
            content: formData.content,
            authorId: formData.authorId,
            tags: Array.from(formData.tags),
            attachmentId: attachmentId,
        });

        return response;
    };

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // console.log("The current logged in user is: ", user); 
        if (!formData.title || !formData.content || !formData.authorId) {
            setError(() => "Please fill out all fields");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = question ? await update() : await create();
            console.log(response); 
            router.push(`/questions/${response?.$id}/${slugify(formData.title)}`);
        } catch (error: any) {
            setError(error.message);
        }

        setLoading(false);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
            <form
                className="w-full max-w-lg bg-gray-900 p-8 rounded-lg shadow-lg space-y-6"
                onSubmit={submit}
            >
                <h2 className="text-center text-2xl font-bold text-white">
                    {question ? "Update Question" : "Ask a Question"}
                </h2>

                {error && (
                    <LabelInputContainer>
                        <div className="text-center text-red-500">{error}</div>
                    </LabelInputContainer>
                )}

                <LabelInputContainer>
                    <Label htmlFor="title">Title</Label>
                    <Input
                        id="title"
                        name="title"
                        placeholder="Enter a descriptive title..."
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    />
                </LabelInputContainer>

                <LabelInputContainer>
                    <Label htmlFor="content">Details</Label>
                    <RTE
                        value={formData.content}
                        onChange={(value) => setFormData(prev => ({ ...prev, content: value || "" }))}
                    />
                </LabelInputContainer>

                <LabelInputContainer>
                    <Label htmlFor="image">Upload an Image</Label>
                    <Input
                        id="image"
                        name="image"
                        accept="image/*"
                        type="file"
                        onChange={(e) => {
                            const files = e.target.files;
                            if (!files || files.length === 0) return;
                            setFormData(prev => ({ ...prev, attachment: files[0] }));
                        }}
                    />
                </LabelInputContainer>

                <LabelInputContainer>
                    <Label htmlFor="tag">Tags</Label>
                    <div className="flex gap-3">
                        <Input
                            id="tag"
                            name="tag"
                            placeholder="Add tags..."
                            type="text"
                            value={tag}
                            onChange={(e) => setTag(e.target.value)}
                        />
                        <button
                            type="button"
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition"
                            onClick={() => {
                                if (!tag.trim()) return;
                                setFormData(prev => ({ ...prev, tags: new Set([...prev.tags, tag]) }));
                                setTag("");
                            }}
                        >
                            Add
                        </button>
                    </div>
                </LabelInputContainer>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 text-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-blue-500 rounded-md shadow-md transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Processing..." : question ? "Update Question" : "Publish Question"}
                </button>
            </form>
        </div>
    );
};

export default QuestionForm;
