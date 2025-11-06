'use client'

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ExternalLink, X } from "lucide-react";
import { Certificate } from "../services/models/certificates";
import Image from "next/image";
import { isPdf } from "../utils/utils";

interface CertificateModalProps {
    certificate: Certificate | null;
    isOpen: boolean;
    onClose: () => void;
}

const CertificateModal = ({ certificate, isOpen, onClose }: CertificateModalProps) => {
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    if (!certificate) return null;

    const formatDate = (dateString?: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>{certificate.title}</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="h-6 w-6 p-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {
                        certificate.image && (
                            <div className="relative">
                                {
                                    isPdf(certificate.image) ? (
                                        <div className="w-full h-96 rounded-lg shadow-lg">
                                            <embed
                                                src={certificate.image}
                                                type="application/pdf"
                                                className="w-full h-full rounded-lg"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            {
                                                imageLoading && (
                                                    <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
                                                        <p className="text-muted-foreground">Loading certificate...</p>
                                                    </div>
                                                )
                                            }
                                            {
                                                !imageError && (
                                                    <Image
                                                        src={certificate.image}
                                                        alt={`${certificate.title} certificate`}
                                                        width={400}
                                                        height={400}
                                                        className={`w-full h-auto rounded-lg shadow-lg transition-opacity ${imageLoading ? "opacity-0" : "opacity-100"}`}
                                                        onLoad={() => setImageLoading(false)}
                                                        onError={() => {
                                                            setImageError(true);
                                                            setImageLoading(false);
                                                        }}
                                                    />
                                                )
                                            }
                                            {
                                                imageError && (
                                                    <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
                                                        <p className="text-muted-foreground">Failed to load certificate image</p>
                                                    </div>
                                                )
                                            }
                                        </>
                                    )}
                            </div>
                        )
                    }

                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="text-sm">
                                {certificate.issuer}
                            </Badge>
                            {
                                certificate.issue_date && (
                                    <Badge variant="outline" className="text-sm">
                                        {formatDate(certificate.issue_date)}
                                    </Badge>
                                )
                            }
                        </div>
                        {
                            certificate.description && (
                                <p className="text-muted-foreground leading-relaxed">
                                    {certificate.description}
                                </p>
                            )
                        }
                        {
                            certificate.certificate_url && (
                                <Button asChild className="w-fit">
                                    <a
                                        href={certificate.certificate_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        View Certificate
                                    </a>
                                </Button>
                            )
                        }
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CertificateModal