import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, FileText, GraduationCap, School, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Resources() {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-5 sm:px-6">
          <h1 className="text-2xl font-bold text-neutral-900">Karnataka Education Resources</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Access important resources and government schemes for students, schools and officials
          </p>
        </div>

        <div className="mt-6 px-4 sm:px-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Scholarship Schemes */}
          <Card>
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                <GraduationCap className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Scholarship Schemes</CardTitle>
              <CardDescription>Financial aid opportunities for students</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                <li className="text-sm">• Karnataka Minority Scholarship</li>
                <li className="text-sm">• Post-Matric Scholarship</li>
                <li className="text-sm">• Vidyasiri Scholarship</li>
                <li className="text-sm">• Food and Accommodation Scholarship</li>
              </ul>
              <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                <ExternalLink className="h-4 w-4" /> View Details
              </Button>
            </CardContent>
          </Card>

          {/* School Development Programs */}
          <Card>
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                <School className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>School Development</CardTitle>
              <CardDescription>Programs for infrastructure improvement</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                <li className="text-sm">• School Infrastructure Development Grant</li>
                <li className="text-sm">• Digital Classroom Transformation</li>
                <li className="text-sm">• Library Enhancement Program</li>
                <li className="text-sm">• School Sanitation Initiative</li>
              </ul>
              <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                <ExternalLink className="h-4 w-4" /> View Details
              </Button>
            </CardContent>
          </Card>

          {/* Teacher Training */}
          <Card>
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Teacher Training</CardTitle>
              <CardDescription>Professional development opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                <li className="text-sm">• Digital Skills Enhancement Program</li>
                <li className="text-sm">• Subject Matter Expert Training</li>
                <li className="text-sm">• Modern Teaching Methodologies</li>
                <li className="text-sm">• Research and Innovation Workshop</li>
              </ul>
              <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                <ExternalLink className="h-4 w-4" /> View Details
              </Button>
            </CardContent>
          </Card>

          {/* Mid-Day Meal Scheme */}
          <Card>
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-2">
                <FileText className="w-6 h-6 text-amber-600" />
              </div>
              <CardTitle>Mid-Day Meal Scheme</CardTitle>
              <CardDescription>Nutrition program for students</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                <li className="text-sm">• Akshara Dasoha Program Guidelines</li>
                <li className="text-sm">• Nutritional Standards Documentation</li>
                <li className="text-sm">• Food Safety Regulations</li>
                <li className="text-sm">• Program Monitoring Framework</li>
              </ul>
              <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                <ExternalLink className="h-4 w-4" /> View Details
              </Button>
            </CardContent>
          </Card>

          {/* Educational Policies */}
          <Card>
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-2">
                <FileText className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle>Educational Policies</CardTitle>
              <CardDescription>Key policy documents and guidelines</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                <li className="text-sm">• Karnataka Education Act</li>
                <li className="text-sm">• Right to Education (RTE) Guidelines</li>
                <li className="text-sm">• Student Assessment Framework</li>
                <li className="text-sm">• School Administrative Regulations</li>
              </ul>
              <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                <ExternalLink className="h-4 w-4" /> View Details
              </Button>
            </CardContent>
          </Card>

          {/* Special Education Resources */}
          <Card>
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mb-2">
                <School className="w-6 h-6 text-teal-600" />
              </div>
              <CardTitle>Special Education</CardTitle>
              <CardDescription>Resources for inclusive education</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-4">
                <li className="text-sm">• Inclusive Education Guidelines</li>
                <li className="text-sm">• Learning Disability Support</li>
                <li className="text-sm">• Assistive Technology Resources</li>
                <li className="text-sm">• Special Educator Training Programs</li>
              </ul>
              <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                <ExternalLink className="h-4 w-4" /> View Details
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}