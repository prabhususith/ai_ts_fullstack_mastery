{{/*
Expand the name of the chart.
*/}}
{{- define "ai-ts-fullstack.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "ai-ts-fullstack.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "ai-ts-fullstack.labels" -}}
helm.sh/chart: {{ include "ai-ts-fullstack.name" . }}-{{ .Chart.Version | replace "+" "_" }}
{{ include "ai-ts-fullstack.selectorLabels" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: ai-enterprise-ecosystem
{{- end }}

{{/*
Selector labels
*/}}
{{- define "ai-ts-fullstack.selectorLabels" -}}
app.kubernetes.io/name: {{ include "ai-ts-fullstack.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
