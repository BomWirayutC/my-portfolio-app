'use client';

import React, { useState } from "react";
import { Certificate, Certificates } from "../services/models/certificates";
import { CertificateModal } from "./";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import Image from "next/image";
import { Award } from "lucide-react";
import { Badge } from "./ui/badge";
import { isPdf } from "../utils/utils";

const CertificateSection = ({ certificates }: { certificates: Certificates }) => {
    const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCertificateClick = (certificate: Certificate) => {
        setSelectedCertificate(certificate);
        setIsModalOpen(true);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
        });
    };

    return (
        <>
            {certificates.length > 0 && (
                <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Certifications</h2>
                        <p className="text-xl text-muted-foreground">
                            Professional certifications and achievements
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {
                            certificates.map((certificate, index) => (
                                <Card
                                    key={certificate.id}
                                    className="group hover:shadow-lg transition-all duration-300 cursor-pointer animate-slide-up"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                    onClick={() => handleCertificateClick(certificate)}
                                >
                                    <CardHeader className="space-y-4">
                                        {certificate.image && (
                                            <div className="relative overflow-hidden rounded-lg aspect-video">
                                                <Image
                                                    src={isPdf(certificate.image) ? certificate.certificate_image_preview || "" : certificate.image}
                                                    alt={`${certificate.title} certificate`}
                                                    width={400}
                                                    height={225}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    priority={true}
                                                />
                                                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                    <Award className="w-8 h-8 text-white" />
                                                </div>
                                            </div>
                                        )}
                                        <div>
                                            <CardTitle className="text-lg">{certificate.title}</CardTitle>
                                            <CardDescription className="text-primary font-medium">
                                                {certificate.issuer}
                                            </CardDescription>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {certificate.issue_date && (
                                            <Badge variant="secondary" className="text-xs">
                                                {formatDate(certificate.issue_date)}
                                            </Badge>
                                        )}
                                        {certificate.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {certificate.description}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        }
                    </div>
                </div>
            )}

            {/* Certificate Modal */}
            <CertificateModal
                certificate={selectedCertificate}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    )
}

export default CertificateSection;