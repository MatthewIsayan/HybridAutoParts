package com.hybridautoparts.backend.controller;

import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import com.hybridautoparts.backend.config.RequestCorrelation;
import com.hybridautoparts.backend.dto.ApiErrorResponse;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import java.util.LinkedHashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ApiExceptionHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(
            MethodArgumentNotValidException exception,
            HttpServletRequest request
    ) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError fieldError : exception.getBindingResult().getFieldErrors()) {
            fieldErrors.putIfAbsent(fieldError.getField(), fieldError.getDefaultMessage());
        }

        return buildResponse(request, HttpStatus.BAD_REQUEST, "validation_error", "Validation failed.", fieldErrors, exception, false);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleConstraintViolation(
            ConstraintViolationException exception,
            HttpServletRequest request
    ) {
        return buildResponse(
                request,
                HttpStatus.BAD_REQUEST,
                "validation_error",
                "Validation failed.",
                Map.of("request", exception.getMessage()),
                exception,
                false
        );
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiErrorResponse> handleResponseStatusException(
            ResponseStatusException exception,
            HttpServletRequest request
    ) {
        HttpStatus status = HttpStatus.valueOf(exception.getStatusCode().value());
        String errorCode = switch (status) {
            case BAD_REQUEST -> "bad_request";
            case UNAUTHORIZED -> "unauthorized";
            case FORBIDDEN -> "forbidden";
            case NOT_FOUND -> "not_found";
            case CONFLICT -> "conflict";
            case PAYLOAD_TOO_LARGE -> "payload_too_large";
            case UNSUPPORTED_MEDIA_TYPE -> "unsupported_media_type";
            case METHOD_NOT_ALLOWED -> "method_not_allowed";
            default -> "request_error";
        };

        return buildResponse(
                request,
                status,
                errorCode,
                exception.getReason(),
                Map.of(),
                exception,
                status.is5xxServerError()
        );
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleEntityNotFound(
            EntityNotFoundException exception,
            HttpServletRequest request
    ) {
        return buildResponse(request, HttpStatus.NOT_FOUND, "not_found", exception.getMessage(), Map.of(), exception, false);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleUnreadableMessage(
            HttpMessageNotReadableException exception,
            HttpServletRequest request
    ) {
        String message = exception.getCause() instanceof InvalidFormatException
                ? "Request payload contains an invalid value."
                : "Request payload could not be read.";
        return buildResponse(request, HttpStatus.BAD_REQUEST, "bad_request", message, Map.of(), exception, false);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiErrorResponse> handleArgumentTypeMismatch(
            MethodArgumentTypeMismatchException exception,
            HttpServletRequest request
    ) {
        String parameterName = exception.getName() == null ? "request" : exception.getName();
        return buildResponse(
                request,
                HttpStatus.BAD_REQUEST,
                "bad_request",
                "Request parameter type is invalid.",
                Map.of(parameterName, "Value is not in the expected format."),
                exception,
                false
        );
    }

    @ExceptionHandler(MissingServletRequestPartException.class)
    public ResponseEntity<ApiErrorResponse> handleMissingRequestPart(
            MissingServletRequestPartException exception,
            HttpServletRequest request
    ) {
        return buildResponse(
                request,
                HttpStatus.BAD_REQUEST,
                "bad_request",
                "Required multipart data is missing.",
                Map.of(exception.getRequestPartName(), "This file input is required."),
                exception,
                false
        );
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiErrorResponse> handleMissingRequestParameter(
            MissingServletRequestParameterException exception,
            HttpServletRequest request
    ) {
        return buildResponse(
                request,
                HttpStatus.BAD_REQUEST,
                "bad_request",
                "Required request parameter is missing.",
                Map.of(exception.getParameterName(), "This parameter is required."),
                exception,
                false
        );
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiErrorResponse> handleUploadTooLarge(
            MaxUploadSizeExceededException exception,
            HttpServletRequest request
    ) {
        return buildResponse(
                request,
                HttpStatus.PAYLOAD_TOO_LARGE,
                "payload_too_large",
                "Uploaded file exceeds the allowed size limit.",
                Map.of(),
                exception,
                false
        );
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiErrorResponse> handleUnsupportedMediaType(
            HttpMediaTypeNotSupportedException exception,
            HttpServletRequest request
    ) {
        return buildResponse(
                request,
                HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                "unsupported_media_type",
                "Request media type is not supported.",
                Map.of(),
                exception,
                false
        );
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiErrorResponse> handleMethodNotSupported(
            HttpRequestMethodNotSupportedException exception,
            HttpServletRequest request
    ) {
        return buildResponse(
                request,
                HttpStatus.METHOD_NOT_ALLOWED,
                "method_not_allowed",
                "Request method is not allowed for this resource.",
                Map.of(),
                exception,
                false
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnhandledException(Exception exception, HttpServletRequest request) {
        return buildResponse(
                request,
                HttpStatus.INTERNAL_SERVER_ERROR,
                "internal_error",
                "An unexpected server error occurred.",
                Map.of(),
                exception,
                true
        );
    }

    private ResponseEntity<ApiErrorResponse> buildResponse(
            HttpServletRequest request,
            HttpStatus status,
            String errorCode,
            String message,
            Map<String, String> fieldErrors,
            Exception exception,
            boolean errorLevel
    ) {
        logException(request, status, errorCode, exception, errorLevel);
        return ResponseEntity.status(status).body(
                new ApiErrorResponse(errorCode, message, fieldErrors, RequestCorrelation.getRequestId(request))
        );
    }

    private void logException(
            HttpServletRequest request,
            HttpStatus status,
            String errorCode,
            Exception exception,
            boolean errorLevel
    ) {
        var loggingEvent = (errorLevel ? LOGGER.atError() : LOGGER.atWarn())
                .addKeyValue("event", "api_error_response")
                .addKeyValue("requestId", RequestCorrelation.getRequestId(request))
                .addKeyValue("method", request.getMethod())
                .addKeyValue("path", request.getRequestURI())
                .addKeyValue("status", status.value())
                .addKeyValue("errorCode", errorCode);

        if (errorLevel) {
            loggingEvent.setCause(exception);
        }

        loggingEvent.log("API request failed");
    }
}
