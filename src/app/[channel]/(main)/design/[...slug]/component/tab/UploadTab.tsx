/* eslint-disable import/no-default-export */
import React, { useRef, useState } from 'react'
import { useDesign } from '../../utils/useDesign'
import ImageDesignTool from './ImageDesignTool'

const UploadTab = () => {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const { upload } = useDesign()
    const { isSelectedImage, setSelectedImage, imageValue, setImageValue } = upload
    const [dragActive, setDragActive] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleFile = (file: File) => {
        if (file && file.type.startsWith("image/")) {
            setLoading(true)
            const reader = new FileReader()
            reader.onload = (ev) => {
                setImageValue({
                    ...imageValue,
                    imageUrl: ev.target?.result as string
                })
                setLoading(false)
            }

            const fileInput = document.getElementById("file-select") as HTMLInputElement;
            if (fileInput) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInput.files = dataTransfer.files;
                fileInput.dispatchEvent(new Event("change", { bubbles: true }));
            }


            reader.readAsDataURL(file)
            setSelectedImage()
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        handleFile(file!)
    }

    const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(true)
    }

    const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
    }

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        const file = e.dataTransfer.files?.[0]
        handleFile(file)
    }

    return (
        <div>
            {!isSelectedImage ? (
                <div className="flex items-center justify-center w-full p-2">
                    <label
                        htmlFor="dropzone-file"
                        className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                            </svg>
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG (MAX. 800x400px)</p>
                            {loading && (
                                <div className="w-8 h-8 mt-2 rounded-full border-4 border-gray-300 border-t-blue-500 animate-spin"></div>
                            )}
                        </div>
                        <input
                            id="dropzone-file"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                    </label>
                </div>
            ) : (
                <div>
                    <ImageDesignTool />
                </div>
            )}
        </div>
    )
}

export default UploadTab