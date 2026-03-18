package com.hallyx.workflowsystem.services;

import org.springframework.expression.Expression;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.context.expression.MapAccessor;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.stereotype.Service;

import java.util.Map;

import java.lang.reflect.Method;

@Service
public class RuleEngineService {

    private final ExpressionParser parser = new SpelExpressionParser();
    private static Method CONTAINS_METHOD;
    private static Method STARTS_WITH_METHOD;
    private static Method ENDS_WITH_METHOD;

    static {
        try {
            CONTAINS_METHOD = RuleEngineService.class.getDeclaredMethod("contains", String.class, String.class);
            STARTS_WITH_METHOD = RuleEngineService.class.getDeclaredMethod("startsWith", String.class, String.class);
            ENDS_WITH_METHOD = RuleEngineService.class.getDeclaredMethod("endsWith", String.class, String.class);
        } catch (NoSuchMethodException e) {
            e.printStackTrace();
        }
    }

    public boolean evaluate(String condition, Map<String, Object> data) {
        if (condition == null || condition.trim().isEmpty() || "DEFAULT".equalsIgnoreCase(condition.trim())) {
            return true;
        }

        StandardEvaluationContext context = new StandardEvaluationContext(data);
        context.addPropertyAccessor(new MapAccessor());
        
        if (data != null) {
            data.forEach(context::setVariable);
        }

        context.registerFunction("contains", CONTAINS_METHOD);
        context.registerFunction("startsWith", STARTS_WITH_METHOD);
        context.registerFunction("endsWith", ENDS_WITH_METHOD);

        try {
            Expression expression = parser.parseExpression(condition);
            Boolean result = expression.getValue(context, Boolean.class);
            return result != null && result;
        } catch (Exception e) {
            // Log as info to avoid flooding logs with invalid expressions which might be user-defined
            System.out.println("Condition evaluation issue: " + condition + ". Detail: " + e.getMessage());
            return false;
        }
    }

    public static boolean contains(String target, String search) {
        return target != null && target.contains(search);
    }

    public static boolean startsWith(String target, String prefix) {
        return target != null && target.startsWith(prefix);
    }

    public static boolean endsWith(String target, String suffix) {
        return target != null && target.endsWith(suffix);
    }
}
